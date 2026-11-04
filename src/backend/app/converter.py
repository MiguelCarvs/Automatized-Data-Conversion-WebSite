
from io import BytesIO
from pathlib import Path
import sqlite3
import tempfile
from contextlib import closing

import pandas as pd


MEDIA_TYPES = {
    "CSV": "text/csv",
    "XLSX": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "SQLITE": "application/vnd.sqlite3",
}


def read_file(content: bytes, input_format: str) -> pd.DataFrame:
    """
    Lê o arquivo de origem e retorna seus dados em um DataFrame.
    """

    if input_format == "CSV":
        return pd.read_csv(BytesIO(content), encoding="utf-8-sig")

    if input_format == "XLSX":
        return pd.read_excel(BytesIO(content), engine="openpyxl")

    if input_format == "SQLITE":
        # Cria um arquivo temporário para abrir o banco SQLite.
        with tempfile.TemporaryDirectory() as temp_dir:
            db_path = Path(temp_dir) / "input.db"
            db_path.write_bytes(content)

            with closing(sqlite3.connect(db_path)) as connection:
                tables = pd.read_sql_query(
                    """
                    SELECT name
                    FROM sqlite_master
                    WHERE type = 'table'
                    AND name NOT LIKE 'sqlite_%'
                    ORDER BY name
                    """,
                    connection,
                )["name"].tolist()

                if not tables:
                    raise ValueError(
                        "O banco SQLite não possui tabelas."
                    )

                # No MVP, utilizamos a primeira tabela encontrada.
                table_name = tables[0]

                # Aspas duplas protegem nomes de tabelas com espaços.
                safe_table_name = '"' + table_name.replace('"', '""') + '"'

                return pd.read_sql_query(
                    f"SELECT * FROM {safe_table_name}",
                    connection,
                )

    raise ValueError("Formato de origem não suportado.")



def export_file(data: pd.DataFrame, output_format: str) -> bytes:
    """
    Exporta os dados para o formato desejado e retorna os bytes.
    """

    if output_format == "CSV":
        buffer = BytesIO()

        data.to_csv(
            buffer,
            index=False,
            encoding="utf-8-sig",
        )

        return buffer.getvalue()

    if output_format == "XLSX":
        buffer = BytesIO()

        with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
            data.to_excel(
                writer,
                index=False,
                sheet_name="Dados",
            )

        return buffer.getvalue()

    if output_format == "SQLITE":
        with tempfile.TemporaryDirectory() as temp_dir:
            db_path = Path(temp_dir) / "output.db"

            # Garante o fechamento da conexão SQLite.
            with closing(sqlite3.connect(db_path)) as connection:
                data.to_sql(
                    "converted_data",
                    connection,
                    if_exists="replace",
                    index=False,
                )

                connection.commit()

            # A conexão já está fechada neste ponto.
            return db_path.read_bytes()

    raise ValueError("Formato de destino não suportado.")



def convert_file(
    content: bytes,
    input_format: str,
    output_format: str,
    original_filename: str,
) -> tuple[bytes, str, str]:
    """
    Executa a conversão e retorna:
    conteúdo convertido, nome do arquivo e tipo MIME.
    """

    input_format = input_format.upper()
    output_format = output_format.upper()

    supported_formats = {"CSV", "XLSX", "SQLITE"}

    if input_format not in supported_formats:
        raise ValueError("Formato de origem não suportado.")

    if output_format not in supported_formats:
        raise ValueError("Formato de destino não suportado.")

    if input_format == output_format:
        raise ValueError("Os formatos de origem e destino são iguais.")

    data = read_file(content, input_format)

    converted_content = export_file(data, output_format)

    original_name = Path(original_filename).stem
    extension = "sqlite" if output_format == "SQLITE" else output_format.lower()

    output_filename = f"{original_name}_converted.{extension}"

    return (
        converted_content,
        output_filename,
        MEDIA_TYPES[output_format],
    )