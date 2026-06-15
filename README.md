# 2026.1-MeasureSoftGram-Plugin

> Extensão para Visual Studio Code que integra o **MeasureSoftGram** diretamente ao seu editor, exibindo métricas e medições de qualidade de software em uma sidebar interativa construída com React.

---

## Pré-requisitos

Antes de começar, garanta que você tem instalado:

- [Node.js](https://nodejs.org/) (recomendado: versão LTS)
- [npm](https://www.npmjs.com/)
- [Visual Studio Code](https://code.visualstudio.com/) versão **1.120.0 ou superior**
- [TypeScript](https://www.typescriptlang.org/) (instalado automaticamente como dependência de desenvolvimento)

---

## Estrutura do Projeto

```
2026.1-MeasureSoftGram-Plugin/
├── .vscode/
│   ├── launch.json           # Configuração de debug (Run Extension)
│   └── tasks.json            # Tarefas automatizadas (build)
├── assets/
│   └── icon.svg              # Ícone da extensão na Activity Bar
├── src/
│   ├── panels/               # Lógica dos painéis/webviews
│   ├── utilities/            # Funções utilitárias
│   └── extension.ts          # Ponto de entrada da extensão
├── webview-ui/               # Frontend React (interface da sidebar)
│   └── src/
│       └── ...               # Componentes e lógica React
├── package.json              # Manifesto da extensão VS Code
└── tsconfig.json             # Configuração do TypeScript
```

A extensão é dividida em duas partes:

- **`src/`** - código da extensão em TypeScript que roda no processo do VS Code (Node.js).
- **`webview-ui/`** - interface React que renderiza dentro do painel lateral (webview).

---

## Depuração (Debug)

A configuração de debug já está pronta em `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run Extension",
      "type": "extensionHost",
      "request": "launch",
      "args": ["--extensionDevelopmentPath=${workspaceFolder}"],
      "outFiles": ["${workspaceFolder}/out/**/*.js"],
      "preLaunchTask": "${defaultBuildTask}"
    }
  ]
}
```

Para depurar:

1. Defina breakpoints em qualquer arquivo dentro de `src/`.
2. Pressione **F5** para iniciar a sessão de debug.
3. A extensão será compilada automaticamente (via `preLaunchTask`) antes de abrir a janela de desenvolvimento.
4. O painel **RUN AND DEBUG** do VS Code exibirá variáveis, call stack e watch em tempo real.

---

## Scripts Disponíveis

| Script | Descrição |
|---|---|
| `npm run install:all` | Instala dependências da extensão e da webview |
| `npm run start:webview` | Inicia o servidor de dev do frontend React |
| `npm run build:webview` | Gera o build de produção da webview |
| `npm run compile` | Compila o TypeScript da extensão (`src/` → `out/`) |
| `npm run watch` | Compila em modo watch (recompila ao salvar) |
| `npm run lint` | Executa o ESLint nos arquivos de `src/` |
| `npm run test` | Executa os testes da extensão via `vscode-test` |

---

## Como a Extensão Funciona

Quando ativada, a extensão registra uma **sidebar webview** na Activity Bar do VS Code:

- **Container:** `msgram-sidebar` (aparece como "MeasureSoftGram" na Activity Bar)
- **View:** `msgram.sidebarView` - um painel do tipo `webview` chamado "Measure"

A interface exibida no painel é o app React localizado em `webview-ui/`, que se comunica com a extensão principal via a API de mensagens do VS Code (`postMessage` / `onDidReceiveMessage`).

```
VS Code Extension (src/)
        ↕ postMessage / onDidReceiveMessage
React App (webview-ui/)
```