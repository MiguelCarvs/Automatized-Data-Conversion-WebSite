from fastapi import FastAPI

app = FastAPI(
    title="DataStr API",
    description="API para conversão entre arquivos CSV, XLSX e SQLite.",
    version="0.1.0",
)


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