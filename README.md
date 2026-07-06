<div align="center">

# MeasureSoftGram

**Análise multidimensional da qualidade de software, direto no VS Code.**

[![License: AGPL v3](https://img.shields.io/badge/license-AGPL--v3-orange.svg)](https://www.gnu.org/licenses/agpl-3.0)
&nbsp;
[![VS Code Marketplace](https://img.shields.io/badge/VS%20Code-Marketplace-blue.svg)](https://marketplace.visualstudio.com/vscode)
&nbsp;
[![Site Oficial](https://img.shields.io/badge/Site-MeasureSoftGram-green.svg)](https://github.com/fga-eps-mds/MeasureSoftGram-Service)

[Instalar Extensão](#instalação) · [Site Oficial](https://msgram.lappis.rocks/) · [Reportar Bug](https://github.com/fga-eps-mds/MeasureSoftGram-Plugin/issues) · [Documentação](https://github.com/fga-eps-mds/MeasureSoftGram-Plugin)

</div>

---

## Visão geral

O painel exibe o indicador multidimensional da qualidade de software **TSQMI**, as três características de qualidade com valores e metas definidas pela equipe, e emite alertas de regressão antes de cada commit.

![Painel principal do plugin mostrando score 0.86 e características Reliability, Maintainability e Functional Suitability](https://raw.githubusercontent.com/fga-eps-mds/2026.1-MeasureSoftGram-Plugin/refs/heads/develop/assets/painel-principal.png)
---

## O que o plugin faz

- **Indicador Multidimensional da Qualidade Geral/Total do Software (TSQMI)** - um único número de 0 a 1 que resume a saúde do projeto, calculado por um metamodelo algébrico original (produto de Hadamard + norma de Frobenius).
- **Três dimensões de qualidade** - Confiabilidade, Manutenibilidade e Adequação Funcional, cada uma com valor atual e meta configurável.
- **Dashboards Grafana embutidos** - quatro painéis analíticos carregados diretamente dentro do VS Code, sem abrir o browser.
- **Visibilidade de log** - todas as chamadas à API ficam visíveis no painel Output do VS Code para fácil diagnóstico.
- **MeasureSoftGram Action** - executa a action que publica a qualidade de software direto no MeasureSoftGram.


---

## Instalação

1. Instale a extensão no VS Code e crie sua conta em no [MeasureSoftGram](https://github.com/fga-eps-mds/MeasureSoftGram-Service)
2. Clique no ícone **MeasureSoftGram** na Activity Bar lateral
3. Ou acesse via paleta de comandos: `Ctrl+Shift+P` → `MeasureSoftGram: Abrir Painel`
4. Faça login com sua conta - pronto.

---

## Dashboards Grafana integrados

A aba **Grafana** carrega os dashboards diretamente no VS Code, já filtrados pelo produto e repositório selecionados. São quatro painéis cobrindo aspectos complementares da qualidade.

### Lista de dashboards

![Aba Grafana mostrando a lista de 4 dashboards disponíveis](https://raw.githubusercontent.com/fga-eps-mds/2026.1-MeasureSoftGram-Plugin/refs/heads/develop/assets/grafana-lista-dashboards.png)

---

### Dashboard 1 - Visão Geral de Qualidade

Visão consolidada do produto: contadores de repositórios, arquivos, características e métricas coletadas; gauges de TSQMI por repositório; gráfico **Planejado vs Realizado** por característica; e radar comparando as características entre os repositórios.

![Dashboard Visão Geral de Qualidade com gauges de TSQMI, gráfico Planejado vs Realizado e radar de características](https://raw.githubusercontent.com/fga-eps-mds/2026.1-MeasureSoftGram-Plugin/refs/heads/develop/assets/grafana-visao-geral.png)

---

### Dashboard 2 - Pulso de Qualidade (ECG)

Evolução do TSQMI ao longo do tempo no formato de "batimento cardíaco" - uma linha por repositório. Ideal para identificar instabilidades e períodos de queda na qualidade.

![Dashboard de Pulso mostrando evolução do TSQMI em formato ECG para CLI (0.859), Core (0.165) e Front (0.479)](https://raw.githubusercontent.com/fga-eps-mds/2026.1-MeasureSoftGram-Plugin/refs/heads/develop/assets/grafana-dashboard-pulso.png)

---

### Dashboard 3 - Hierarquia Completa de Qualidade

Evolução temporal em quatro camadas: **Características → Subcaracterísticas → Medidas → Métricas Coletadas**. Filtrável por repositório e característica.

**Características e subcaracterísticas:**

![Evolução temporal de Functional Suitability e subcaracterísticas para o repositório CLI](https://raw.githubusercontent.com/fga-eps-mds/2026.1-MeasureSoftGram-Plugin/refs/heads/develop/assets/grafana-evolucao-temporal-1.png)

**Medidas e métricas coletadas:**

![Evolução temporal das medidas e métricas coletadas com tooltip mostrando Team Throughput 0.708](https://raw.githubusercontent.com/fga-eps-mds/2026.1-MeasureSoftGram-Plugin/refs/heads/develop/assets/grafana-evolucao-temporal-2.png)

---

### Dashboard 4 - Saúde por Repositório

Evolução de cada característica individualmente como série temporal, com marcadores de release (v2025.1.0, v2025.2.0, v2025.3.0). Permite avaliar o impacto de cada versão sobre Confiabilidade, Manutenibilidade e Adequação Funcional.

![Dashboard Saúde de Qualidade por Repositório mostrando Confiabilidade, Manutenibilidade e Ad. Funcional com marcadores de release](https://raw.githubusercontent.com/fga-eps-mds/2026.1-MeasureSoftGram-Plugin/refs/heads/develop/assets/grafana-saude-qualidade.png)

---

### Action MeasureSoftGram

Executa a action que publica a qualidade de software direto no MeasureSoftGram, com log detalhado no painel Output do VS Code.

![Execução da Action](https://raw.githubusercontent.com/fga-eps-mds/2026.1-MeasureSoftGram-Plugin/refs/heads/develop/assets/action.png)

---

## Sobre o modelo de qualidade

Trata-se de um modelo hierárquico, multinível, multivariado e multidimensional. O MeasureSoftGram usa um metamodelo algébrico (original), que representa a qualidade de produto de software no espaço R_N. Utiliza a combinação do [produto de Hadamard](https://en.wikipedia.org/wiki/Hadamard_product_(matrices)) com [norma de Frobenius](https://en.wikipedia.org/wiki/Matrix_norm#Frobenius_norm), para agregar métricas e medidas em indicadores multidimensionais de qualidade. O resultado é um indicador multidimensional, contínuo, rastreável ao longo do tempo e que expressa a percepção quantitativa da qualidade de software.

---

<div align="center">

[Site Oficial](https://msgram.lappis.rocks/) · [Reportar Bug](https://github.com/fga-eps-mds/MeasureSoftGram-Plugin/issues) · [Docs](https://github.com/fga-eps-mds/MeasureSoftGram-Plugin) · Licença AGPL v3

</div>