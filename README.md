# MeasureSoftGram Plugin

Extensão para VS Code que exibe métricas de qualidade de software do [MeasureSoftGram Service](https://github.com/fga-eps-mds/2026.1-MeasureSoftGram-Service) diretamente na sidebar do editor.

---

## Pré-requisitos

- [Node.js 20+](https://nodejs.org/) (recomendado via `nvm use 20`)
- [VS Code](https://code.visualstudio.com/)
- Uma URL de service e um token de autenticação válidos (veja as opções abaixo)

---

## 1. Obter URL e token do service

O plugin precisa de três informações para se conectar: **Service URL**, **Token** e **Product Name**.

Você tem duas opções:

### Opção A — Usar um ambiente de homologação ou produção já existente

Se o time já disponibilizou um ambiente de homologação, basta solicitar as credenciais (URL, token e nome do produto) e pular para o [passo 3](#3-instalar-dependências-e-compilar-o-plugin).

### Opção B — Subir o service localmente com Docker

Caso não tenha acesso a um ambiente externo, você pode rodar o service na sua máquina. Para isso você também precisará de:

- [Docker](https://docs.docker.com/get-docker/) e Docker Compose
- Repositório do service clonado como irmão deste repositório:
  ```
  alguma-pasta/
  ├── 2026.1-MeasureSoftGram-Plugin/   ← este repositório
  └── 2026.1-MeasureSoftGram-Service/  ← service backend
  ```

#### 1.1 Subir o service

```bash
cd ../2026.1-MeasureSoftGram-Service
docker compose up -d
```

Verifique se o service inicializou corretamente:

```bash
docker compose logs service --tail 20
```

Aguarde a mensagem `RUNNING SERVER` nos logs. Você também pode confirmar que a API está no ar:

```bash
curl -s http://localhost:8080/api/v1/accounts/login/ -o /dev/null -w "%{http_code}"
# Resposta esperada: 405
```

> O código `405` (Method Not Allowed no GET) indica que o service está respondendo corretamente.

#### 1.2 Obter o token

Faça login com as credenciais padrão do ambiente local:

```bash
curl -s -X POST http://localhost:8080/api/v1/accounts/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

Resposta esperada:

```json
{ "key": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2" }
```

Guarde o valor de `key` — ele será usado como token no plugin.

As credenciais de configuração para o ambiente local são:

| Campo | Valor |
|---|---|
| **Service URL** | `http://localhost:8080` |
| **Token** | valor retornado pelo login acima |
| **Product Name** | `MeasureSoftGram` |

---

## 2. Instalar dependências e compilar o plugin

Na raiz deste repositório:

```bash
nvm use 20
npm run install:all
npm run build:webview
npm run compile
```

---

## 3. Executar o plugin no VS Code

Abra o repositório no VS Code:

```bash
code .
```

Pressione **F5** para iniciar o **Extension Development Host** — uma nova janela do VS Code abrirá com o plugin ativo.

> Se aparecer um menu pedindo para selecionar um ambiente de debug, escolha **VS Code Extension Development**.

---

## 4. Configurar o plugin

Na janela do Extension Development Host:

1. Clique no ícone do **MeasureSoftGram** na barra lateral esquerda
2. Navegue até a aba **Settings**
3. Preencha os campos com as credenciais obtidas no passo 1 e clique em **Salvar e validar conexão**

---

## 5. Verificar o funcionamento

### Dashboard

Após salvar as configurações, o dashboard deve exibir:

- Score geral (TSQMI) entre 0 e 1
- Características (ex.: Reliability, Maintainability) com valores e metas
- Dropdown para selecionar entre os repositórios do produto

### Log de requisições

O plugin registra todas as chamadas feitas ao service. Para visualizar:

1. Abra **View → Output** no VS Code
2. No dropdown do painel Output, selecione **MeasureSoftGram API**

Exemplo de log esperado:

```
[14:52:01] GET http://localhost:8080/api/v1/organizations/
[14:52:01] → Organização: "fga-eps-mds" (id=1)
[14:52:01] GET http://localhost:8080/api/v1/organizations/1/products/
[14:52:01] → Produto: "MeasureSoftGram" (id=3)
[14:52:01] GET http://localhost:8080/api/v1/organizations/1/products/3/repositories/
[14:52:01] → 4 repositório(s): 2022-1-MeasureSoftGram-CLI, ...
[14:52:01] Buscando métricas para repositório "2022-1-MeasureSoftGram-Service" (id=6)
[14:52:01] → TSQMI: 0.9830
[14:52:01] → Reliability: 0.4782
[14:52:01] → Maintainability: 0.9984
```

### Django Admin (apenas ambiente local)

Acesse `http://localhost:8080/admin` (usuário `admin`, senha `admin`) para navegar pelas entidades e conferir os dados no banco.

---

## Modo sem service (dados mockados)

Quando o plugin é aberto **sem** as configurações preenchidas, ele exibe automaticamente dados mockados para facilitar o desenvolvimento de UI:

| Campo | Valor mock |
|---|---|
| Score (TSQMI) | `0.94` |
| Reliability | `0.82` (meta 0.80) |
| Maintainability | `0.68` (meta 0.75) |
| Security | `0.71` (meta 0.70) |

O log indicará: `Sem configuração — usando dados mockados.`

---

## Parar o service local

```bash
cd ../2026.1-MeasureSoftGram-Service
docker compose down
```

---

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run install:all` | Instala dependências da extensão e da webview |
| `npm run build:webview` | Compila o frontend React da sidebar |
| `npm run compile` | Compila o código TypeScript da extensão |
| `npm run watch` | Recompila automaticamente ao salvar arquivos |
| `npm run lint` | Executa o ESLint |
| `npm run test` | Executa os testes da extensão |
