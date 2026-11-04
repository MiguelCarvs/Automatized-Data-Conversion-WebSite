from pathlib import Path

from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.responses import StreamingResponse

from io import BytesIO
from urllib.parse import quote

from .converter import convert_file

app = FastAPI(
    title="DataStr API",
    description="API para conversão entre arquivos CSV, XLSX e SQLite.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPPORTED_FORMATS = {
    ".csv": "CSV",
    ".xlsx": "XLSX",
    ".sqlite": "SQLite",
    ".db": "SQLite",
    ".sqlite3": "SQLite",
}

# Limite inicial de 10 MiB por arquivo.
MAX_FILE_SIZE = 10 * 1024 * 1024


@app.get("/")
def home():
    return {
        "message": "Bem-vindo à API do DataStr!",
        "status": "online",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.post("/files/inspect")
async def inspect_file(file: UploadFile = File(...)):

    # 1. Verifica se o arquivo possui nome.
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Nenhum arquivo foi informado."
        )

    # 2. Identifica a extensão do arquivo.
    extension = Path(file.filename).suffix.lower()
    input_format = SUPPORTED_FORMATS.get(extension)

    if input_format is None:
        raise HTTPException(
            status_code=415,
            detail="Formato não suportado.",
        )

    # 3. Lê no máximo o limite permitido mais um byte.
    content = await file.read(MAX_FILE_SIZE + 1)

    if not content:
        raise HTTPException(
            status_code=400,
            detail="O arquivo está vazio.",
        )

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="O arquivo excede o limite de 10 MiB."
        )

    # 4. Retorna os metadados do arquivo.
    return {
        "filename": Path(file.filename).name,
        "input_format": input_format,
        "size_bytes": len(content),
        "message": "Arquivo recebido para inspeção.",
    }


@app.post("/convert")
async def convert(
    file: UploadFile = File(...),
    output_format: str = Form(...),
):
    # 1. Verifica se o arquivo possui nome.
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Nenhum arquivo foi informado."
        )

    # 2. Identifica o formato de origem.
    extension = Path(file.filename).suffix.lower()
    input_format = SUPPORTED_FORMATS.get(extension)

    if input_format is None:
        raise HTTPException(
            status_code=415,
            detail="Formato de origem não suportado."
        )

    # 3. Verifica o formato de destino.
    output_format = output_format.upper()

    if output_format not in {"CSV", "XLSX", "SQLITE"}:
        raise HTTPException(
            status_code=415,
            detail="Formato de destino não suportado."
        )

    if input_format.upper() == output_format:
        raise HTTPException(
            status_code=400,
            detail="O formato de origem e destino são iguais."
        )

    # 4. Lê e valida o arquivo.
    content = await file.read(MAX_FILE_SIZE + 1)
    await file.close()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="O arquivo está vazio."
        )

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="O arquivo excede o limite de 10 MiB."
        )

    # 5. Executa a conversão.
    try:
        converted_content, output_filename, media_type = convert_file(
            content=content,
            input_format=input_format,
            output_format=output_format,
            original_filename=file.filename,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        ) from error

    # 6. Prepara o arquivo para download.
    encoded_filename = quote(output_filename)

    return StreamingResponse(
        BytesIO(converted_content),
        media_type=media_type,
        headers={
            "Content-Disposition": (
                f"attachment; filename*=UTF-8''{encoded_filename}"
            )
        },
    )
