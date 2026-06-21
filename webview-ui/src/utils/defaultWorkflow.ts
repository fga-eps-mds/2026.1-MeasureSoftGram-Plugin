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
        uses: ./
        id: msgram
        with:
          githubToken: \${{ secrets.GITHUB_TOKEN }} # Token do GitHub
          sonarProjectKey: \${{ secrets.SONAR_TOKEN }} # (opcional) Chave do projeto no SonarQube
          msgramServiceToken: \${{ secrets.MSGRAM_TOKEN }} # Token para acessar o serviço MeasureSoftGram
          productName: "MeasureSoftGram" # Nome do produto
          workflowName: 'Build' # Nome do seu worflow que realiza a build da release
          collectSonarqubeMetrics: true # Flag que determina se métricas do Sonarqube serão persistidas
          collectGithubMetrics: true # Flag que determina se métricas do Github serão persistidas
          usLabel: "US"
`;