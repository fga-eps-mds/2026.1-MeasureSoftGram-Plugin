# MeasureSoftGram

**Análise multidimensional da qualidade de software, diretamente no VS Code.**

[![License: AGPL v3](https://img.shields.io/badge/license-AGPL--v3-orange.svg)](https://www.gnu.org/licenses/agpl-3.0)

---

![Dashboard MeasureSoftGram](assets/screenshots/dashboard.png)

---

## Features

**Dashboard de qualidade por release**

![Painel de métricas por release](assets/screenshots/releases.png)

Acompanhe a evolução das características de qualidade (manutenibilidade, confiabilidade, usabilidade...) ao longo do tempo, com indicadores agregados entre 0 e 1.

---

**Comparação meta x realizado**

![Comparação planejado vs desenvolvido](assets/screenshots/comparison.png)

Defina metas de qualidade por release e veja exatamente onde o time ficou acima ou abaixo do planejado — característica por característica.

---

** Configuração de pesos e características**

![Configuração de qualidade](assets/screenshots/config.png)

Ajuste quais características de qualidade monitorar e o peso relativo de cada uma para o contexto do seu projeto.

---

## Como usar

1. Instale a extensão e tenha conta no [MeasureSoftGram](https://msgram.lappis.rocks/)
2. Clique no ícone **MeasureSoftGram** na Activity Bar
3. Ou abra via paleta: `Ctrl+Shift+P` → `MeasureSoftGram: Abrir Painel`
4. Logue com sua conta no MeasureSoftGram e pronto!

---

## Sobre o modelo

O MeasureSoftGram usa um **metamodelo algébrico original** (produto de Hadamard + norma de Frobenius) para agregar métricas brutas em indicadores multidimensionais de qualidade.
 
[Site oficial](https://msgram.lappis.rocks/) · [Issues](https://github.com/fga-eps-mds/MeasureSoftGram-Plugin/issues) · [Docs](https://github.com/fga-eps-mds/MeasureSoftGram-Plugin)