/**
 * Configuração do Mocha para testes fora do VSCode.
 */
'use strict';

module.exports = {
  ui: 'tdd',
  timeout: 10000,
  spec: 'out/tests/**/*.test.js',
  require: [require('path').join(__dirname, 'out/tests/vscode.mock.js')],
};
