# DataStr

**DataStr** é uma aplicação web desenvolvida para realizar a conversão entre diferentes formatos de arquivos utilizados no armazenamento e na manipulação de dados.

O projeto permite que o usuário envie um arquivo, selecione o formato desejado e faça o download do arquivo convertido, por meio de uma interface simples e integrada a uma API desenvolvida em Python.

## Funcionalidades

- Upload de arquivos para conversão.
- Identificação e validação do formato do arquivo enviado.
- Conversão entre os formatos CSV, XLSX e SQLite.
- Download do arquivo convertido.
- Interface web para interação com o sistema.
- API para processamento e conversão dos arquivos.

### Formatos suportados

| Formato de entrada | Formatos de saída |
|---|---|
| CSV | XLSX e SQLite |
| XLSX | CSV e SQLite |
| SQLite | CSV e XLSX |

## Tecnologias utilizadas

### Backend
- **Python:** linguagem utilizada no processamento dos arquivos.
- **FastAPI:** desenvolvimento da API responsável pelas operações de conversão.
- **Pandas:** leitura, manipulação e transformação dos dados.
- **SQLite3:** leitura e criação de bancos de dados SQLite.
- **OpenPyXL:** suporte à leitura e escrita de arquivos XLSX.

### Frontend
- **HTML:** estrutura da aplicação.
- **CSS:** estilização e organização visual.
- **JavaScript:** interatividade, comunicação com a API e gerenciamento das conversões.

## Estrutura do projeto

```text
Automatized-Data-Conversion-WebSite/
│
└── src/
    ├── backend/
    │   ├── app/
    │   │   ├── main.py
    │   │   └── converter.py
    │   │
    │   └── requirements.txt
    │
    └── frontend/
        ├── index.html
        ├── script.js
        └── style.css
```

## Instalação e execução

### 1. Clone o repositório

```bash
git clone https://github.com/MiguelCarvs/Automatized-Data-Conversion-WebSite.git
```

Entre na pasta do projeto:

```bash
cd Automatized-Data-Conversion-WebSite
```

### 2. Configure o backend

Acesse a pasta do backend:

```bash
cd src/backend
```

Crie um ambiente virtual:

```bash
python -m venv .venv
```

Ative o ambiente virtual no Windows (PowerShell):

```powershell
.\.venv\Scripts\Activate.ps1
```

Instale as dependências:

```bash
pip install -r requirements.txt
```

### 3. Execute a API

Ainda na pasta `src/backend`, execute:

```bash
python -m uvicorn app.main:app --reload
```

A API estará disponível em:

```text
http://127.0.0.1:8000
```

A documentação interativa dos endpoints pode ser acessada pelo Swagger:

```text
http://127.0.0.1:8000/docs
```

### 4. Execute o frontend

Abra a pasta `src/frontend` no Visual Studio Code e execute o arquivo `index.html` utilizando a extensão **Live Server**.

Com a API e o frontend em execução, a aplicação estará pronta para uso.

## Como utilizar

1. Acesse a interface do DataStr.
2. Selecione ou envie o arquivo que deseja converter.
3. Escolha o formato de saída desejado.
4. Inicie a conversão.
5. Aguarde o processamento.
6. Faça o download do arquivo convertido.

## API

O backend disponibiliza endpoints para as operações da aplicação:

| Endpoint | Método | Finalidade |
|---|---|---|
| `/` | GET | Verifica a disponibilidade da API. |
| `/health` | GET | Verifica o estado de funcionamento do serviço. |
| `/files/inspect` | POST | Inspeciona o arquivo enviado. |
| `/convert` | POST | Realiza a conversão do arquivo. |

Para consultar os parâmetros e as respostas de cada endpoint, acesse a documentação interativa em `/docs`.

## Objetivo do projeto

O DataStr foi desenvolvido como projeto acadêmico com o objetivo de aplicar conhecimentos de desenvolvimento web, programação em Python e manipulação de dados.

Além da construção da interface, o projeto envolve a integração entre frontend e backend, o processamento de diferentes formatos de arquivos e a utilização de bibliotecas voltadas à leitura, transformação e armazenamento de dados.

## Autor

**Miguel Carvalho**
**Ícaro Romão**
**Nicolas**
**Israel **

Estudantes de Análise e Desenvolvimento de Sistemas — FATEC.
