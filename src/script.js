const app = document.getElementById("app");

const formats = ["CSV", "XLSX", "SQLite"];

let state = {
  page: "landing",
  file: null,
  inputFormat: null,
  outputFormat: "CSV",
  conversionState: "idle"
};

function detectFormat(filename) {
  const ext = filename.split(".").pop()?.toLowerCase();

  if (ext === "csv") return "CSV";
  if (ext === "xlsx" || ext === "xls") return "XLSX";
  if (ext === "sqlite" || ext === "db" || ext === "sqlite3") return "SQLite";

  return null;
}

function logo() {
  return `
    <div class="logo">
      <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="5" height="5" fill="white"/>
        <rect x="8" y="1" width="5" height="5" fill="white" opacity=".6"/>
        <rect x="1" y="8" width="5" height="5" fill="white" opacity=".6"/>
        <rect x="8" y="8" width="5" height="5" fill="white"/>
      </svg>
    </div>
  `;
}

function header(backButton = false) {
  return `
    <header class="header">
      ${backButton
        ? `<button class="brand" id="backButton" aria-label="Voltar">${logo()}<span>DataStr</span></button>`
        : `<div class="brand">${logo()}<span>DataStr</span></div>`
      }
      ${backButton
        ? `<span class="uppercase-label mono" style="color:var(--muted-foreground)">Converter</span>`
        : `<button class="header-button" id="headerConverter">Converter</button>`
      }
    </header>
  `;
}

function footer(landing = false) {
  return `
    <footer class="footer">
      <span class="mono">${landing ? "DataStr" : "Nenhum dado é armazenado nos nossos servidores."}</span>
      ${landing ? "<span>Nenhum dado é armazenado.</span>" : ""}
    </footer>
  `;
}

function landingPage() {
  app.innerHTML = `
    <div class="page">
      ${header(false)}

      <main class="main-landing">
        <div class="eyebrow uppercase-label mono">Conversão de arquivos</div>

        <h1 class="hero-title">
          Converta seus arquivos<br>
          <strong>de forma simples</strong><br>
          e rápida.
        </h1>

        <p class="hero-text">
          Transforme dados entre CSV, XLSX e SQLite sem instalação, sem conta.
          Faça o upload, escolha o formato e baixe o arquivo convertido.
        </p>

        <div>
          <button class="primary-button" id="startButton">Começar conversão</button>
        </div>

        <section class="formats">
          <span class="formats-title uppercase-label mono">Formatos suportados</span>
          <div class="badges">
            <span class="badge">CSV</span>
            <span class="badge">XLSX</span>
            <span class="badge">SQLite</span>
          </div>
          <p class="formats-description">
            Suporte a arquivos .csv, .xlsx, .xls, .sqlite, .db e .sqlite3.
            Conversões bidirecionais entre todos os formatos.
          </p>
        </section>
      </main>

      ${footer(true)}
    </div>
  `;

  document.getElementById("startButton").onclick = showConverter;
  document.getElementById("headerConverter").onclick = showConverter;
}

function converterPage() {
  app.innerHTML = `
    <div class="page">
      ${header(true)}

      <main class="main-converter">
        <h1 class="converter-title">Converter arquivo</h1>
        <p class="converter-subtitle">Faça o upload de um arquivo e escolha o formato de saída.</p>

        <div class="drop-zone" id="dropZone">
          <input id="fileInput" class="hidden" type="file"
            accept=".csv,.xlsx,.xls,.sqlite,.db,.sqlite3">

          <div id="uploadContent"></div>
        </div>

        <div class="fields">
          <div>
            <label class="field-label uppercase-label mono">Formato de entrada</label>
            <div class="field-value ${state.inputFormat ? "" : "empty"}">
              <span>${state.inputFormat || "Detectado automaticamente"}</span>
              ${state.inputFormat ? `<span style="color:var(--primary)">✓</span>` : ""}
            </div>
          </div>

          <div>
            <label class="field-label uppercase-label mono">Formato de saída</label>
            <div class="select-wrap">
              <select id="outputFormat" ${state.conversionState === "loading" || state.conversionState === "success" ? "disabled" : ""}>
                ${formats
                  .filter(f => !state.inputFormat || f !== state.inputFormat)
                  .map(f => `<option value="${f}" ${state.outputFormat === f ? "selected" : ""}>${f}</option>`)
                  .join("")}
              </select>
              <span class="select-arrow">⌄</span>
            </div>
          </div>
        </div>

        ${state.conversionState !== "success" ? `
          <button class="convert-button" id="convertButton"
            ${!state.file || state.conversionState === "loading" ? "disabled" : ""}>
            ${state.conversionState === "loading"
              ? `<span class="spinner"></span> Convertendo…`
              : "Converter arquivo"}
          </button>
        ` : ""}

        <div id="feedback"></div>
      </main>

      ${footer(false)}
    </div>
  `;

  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");

  renderUploadContent();

  dropZone.addEventListener("dragover", e => {
    e.preventDefault();
    dropZone.classList.add("dragging");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragging");
  });

  dropZone.addEventListener("drop", e => {
    e.preventDefault();
    dropZone.classList.remove("dragging");

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  dropZone.addEventListener("click", e => {
    if (!state.file && !e.target.closest("button")) {
      fileInput.click();
    }
  });

  fileInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });

  document.getElementById("backButton").onclick = showLanding;

  document.getElementById("outputFormat").onchange = e => {
    state.outputFormat = e.target.value;
  };

  const convertButton = document.getElementById("convertButton");
  if (convertButton) {
    convertButton.onclick = convert;
  }

  renderFeedback();
}

function renderUploadContent() {
  const container = document.getElementById("uploadContent");

  if (!state.file) {
    container.innerHTML = `
      <div class="upload-empty">
        <div class="upload-icon">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 12V3M9 3L5.5 6.5M9 3L12.5 6.5"
              stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/>
            <path d="M2 13V15.5H16V13"
              stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/>
          </svg>
        </div>

        <div class="upload-copy">
          <p class="upload-title">Arraste um arquivo aqui</p>
          <p class="upload-subtitle">CSV, XLSX ou SQLite</p>
        </div>

        <button class="secondary-button" id="selectButton">Selecionar arquivo</button>
      </div>
    `;

    document.getElementById("selectButton").onclick = e => {
      e.stopPropagation();
      document.getElementById("fileInput").click();
    };

    return;
  }

  const size = (state.file.size / 1024).toFixed(1);

  container.innerHTML = `
    <div class="file-info">
      <div class="file-details">
        <div class="file-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 1h7l3 3v11H2V1z" stroke="white" stroke-width="1.2"/>
            <path d="M9 1v3h3M5 8h6M5 10.5h4"
              stroke="white" stroke-width="1" stroke-linecap="square"/>
          </svg>
        </div>

        <div>
          <p class="file-name">${escapeHtml(state.file.name)}</p>
          <p class="file-meta">
            ${size} KB
            ${state.inputFormat ? `<span class="file-format">${state.inputFormat}</span>` : ""}
          </p>
        </div>
      </div>

      <button class="text-button" id="removeButton">Remover</button>
    </div>
  `;

  document.getElementById("removeButton").onclick = e => {
    e.stopPropagation();
    reset();
  };
}

function renderFeedback() {
  const feedback = document.getElementById("feedback");

  if (state.conversionState === "error") {
    feedback.innerHTML = `
      <div class="feedback">
        <span>ⓘ</span>
        <span>Não foi possível converter o arquivo. Verifique o formato e tente novamente.</span>
      </div>
    `;
    return;
  }

  if (state.conversionState === "success") {
    const extension = {
      CSV: "csv",
      XLSX: "xlsx",
      SQLite: "sqlite"
    }[state.outputFormat];

    const filename = state.file.name.replace(/\.[^.]+$/, "");

    feedback.innerHTML = `
      <div class="success">
        <div class="success-header">
          <div class="success-icon">✓</div>
          <div>
            <p class="success-title">Conversão concluída</p>
            <p class="success-file">${escapeHtml(filename)}.${extension} · ${state.outputFormat}</p>
          </div>
        </div>

        <div class="success-actions">
          <button class="primary-button" id="downloadButton">↓ &nbsp; Baixar arquivo</button>
          <button class="secondary-button" id="newConversionButton">Nova conversão</button>
        </div>
      </div>
    `;

    document.getElementById("downloadButton").onclick = downloadPlaceholder;
    document.getElementById("newConversionButton").onclick = reset;
  }
}

function handleFile(file) {
  state.file = file;
  state.conversionState = "idle";
  state.inputFormat = detectFormat(file.name);

  if (state.inputFormat) {
    state.outputFormat = formats.find(f => f !== state.inputFormat);
  }

  converterPage();
}

function convert() {
  if (!state.file) return;

  state.conversionState = "loading";
  converterPage();

  setTimeout(() => {
    state.conversionState = "success";
    converterPage();
  }, 1800);
}

function reset() {
  state = {
    page: "converter",
    file: null,
    inputFormat: null,
    outputFormat: "CSV",
    conversionState: "idle"
  };

  converterPage();
}

function downloadPlaceholder() {
  /*
   * O projeto original também não realiza uma conversão real:
   * ao clicar em "Converter arquivo", ele apenas espera 1,8s
   * e mostra o estado de sucesso.
   *
   * Para converter CSV/XLSX/SQLite de verdade no navegador,
   * seria necessário adicionar bibliotecas ou implementar os
   * formatos manualmente.
   */
  alert("A interface está pronta. A conversão real dos dados ainda precisa ser implementada.");
}

function showConverter() {
  state.page = "converter";
  converterPage();
}

function showLanding() {
  state.page = "landing";
  landingPage();
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

landingPage();
