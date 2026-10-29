from fastapi import FastAPI

app = FastAPI(
    title="DataStr API",
    description="API para conversão entre arquivos CSV, XLSX e SQLite.",
    version="0.1.0",
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
    return{
        "message": "Bem-vindo à API do DataStr!",
        "status": "online",
    }

@app.get("/health")
def health_check():
    return{
        "status": "healthy"
    }

@app.post("/files/inspect")
async def inspect_file(file: UploadFile = File(...)):
    #1 Verifica se o arquivo possui nome
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Nenhum arquivo foi informado."
        )
    
extension = Path(file.filename).suflix.lower()
input_format = SUPPORTED_FORMATS.get(extension)

if input_format is None:
    raise HTTPException(
        status_code=415,
        detail="Formato não suportado.",
    )

#3. Lê no máximo o limite permitido mais um byte
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

#4. Retorna os metadados do arquivo.
return {
    "filename": Path(file.filename).name,
    "input_format": input_format,
    "size_bytes": len(content),
    "message": "Arquivo recebido para inspeção.",

}
