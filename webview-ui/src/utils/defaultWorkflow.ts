export const DEFAULT_WORKFLOW_YAML = `name: MeasureSoftGram
on:
  workflow_run:
    workflows: ["Build"]
    types:
      - completed
jobs:
  msgram_job:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Action MeasureSoftGram
        uses: fga-eps-mds/MeasureSoftGram-Action@2.1.5
        id: msgram
        with:
          githubToken: # Token do GitHub
          sonarProjectKey: # Chave do projeto no SonarQube
          msgramServiceToken: # Token para acessar o serviço MeasureSoftGram
          productName: # Nome do produto
          workflowName: # Nome do seu worflow que realiza a build da release
          collectSonarqubeMetrics: true # Flag que determina se métricas do Sonarqube serão persistidas
          collectGithubMetrics: true # Flag que determina se métricas do Github serão persistidas
          usLabel: "US"
`;