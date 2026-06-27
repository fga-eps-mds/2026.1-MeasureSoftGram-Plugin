import * as assert from 'assert';
import * as http from 'node:http';
import {AddressInfo} from 'node:net';
import {fetchRepositories, fetchScoreForRepo, login, MsgramSettings,} from '../../services/msgramApi';

type Handler = (req: http.IncomingMessage, res: http.ServerResponse) => void;

function mockServer(handler: Handler): Promise<{ server: http.Server; baseUrl: string }> {
  return new Promise((resolve) => {
    const server = http.createServer(handler);
    server.listen(0, '127.0.0.1', () => {
      const {port} = server.address() as AddressInfo;
      resolve({server, baseUrl: `http://127.0.0.1:${port}`});
    });
  });
}

function json(res: http.ServerResponse, data: unknown, status = 200) {
  res.writeHead(status, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(data));
}

const MOCK_ORG = {id: 1, name: 'fga-eps-mds'};
const MOCK_PRODUCT = {id: 3, name: 'MeasureSoftGram'};
const MOCK_REPOS = [
  {id: 6, name: '2022-1-MeasureSoftGram-Service'},
  {id: 7, name: '2022-1-MeasureSoftGram-Core'},
];
const MOCK_TSQMI = {value: 0.9830292488408795};
const MOCK_CHARS = [
  {name: 'Reliability', latest: {value: 0.47}},
  {name: 'Maintainability', latest: {value: 0.99}},
];

function createFullMockServer(): Promise<{ server: http.Server; baseUrl: string }> {
  return mockServer((req, res) => {
    const url = req.url ?? '';
    if (url === '/api/v1/organizations/') {
      return json(res, {count: 1, results: [MOCK_ORG]});
    }
    if (url === `/api/v1/organizations/${MOCK_ORG.id}/products/`) {
      return json(res, {count: 1, results: [MOCK_PRODUCT]});
    }
    if (url === `/api/v1/organizations/${MOCK_ORG.id}/products/${MOCK_PRODUCT.id}/repositories/`) {
      return json(res, {count: MOCK_REPOS.length, results: MOCK_REPOS});
    }
    if (url.includes('latest-values/tsqmi')) {
      return json(res, url.includes('9999') ? {created_at: null} : MOCK_TSQMI);
    }
    if (url.includes('latest-values/characteristics')) {
      return json(res, {count: MOCK_CHARS.length, results: MOCK_CHARS});
    }
    json(res, {detail: 'Not found.'}, 404);
  });
}

// ── login ─────────────────────────────────────────────────────────────────────

suite('login', () => {
  test('retorna token com credenciais válidas', async () => {
    const {server, baseUrl} = await mockServer((req, res) => {
      let body = '';
      req.on('data', c => (body += c));
      req.on('end', () => {
        const {username, password} = JSON.parse(body);
        username === 'admin' && password === 'admin'
            ? json(res, {key: 'token-abc'})
            : json(res, {non_field_errors: ['Credenciais inválidas.']}, 400);
      });
    });
    try {
      const token = await login(baseUrl, 'admin', 'admin');
      assert.strictEqual(token, 'token-abc');
    } finally {
      server.close();
    }
  });

  test('lança erro HTTP 400 com credenciais inválidas', async () => {
    const {server, baseUrl} = await mockServer((req, res) => {
      json(res, {non_field_errors: ['Credenciais inválidas.']}, 400);
    });
    try {
      await assert.rejects(login(baseUrl, 'x', 'x'), /HTTP 400/);
    } finally {
      server.close();
    }
  });
});

// ── fetchRepositories ─────────────────────────────────────────────────────────

suite('fetchRepositories', () => {
  test('retorna dados mockados quando serviceUrl está vazio', async () => {
    const s: MsgramSettings = {serviceUrl: '', token: '', productName: 'P'};
    const result = await fetchRepositories(s);
    assert.strictEqual(result.orgPk, 0);
    assert.ok(result.repos.length > 0);
  });

  test('retorna organização e produto corretos', async () => {
    const {server, baseUrl} = await createFullMockServer();
    try {
      const s: MsgramSettings = {serviceUrl: baseUrl, token: 'tok', productName: 'MeasureSoftGram'};
      const result = await fetchRepositories(s);
      assert.strictEqual(result.orgPk, MOCK_ORG.id);
      assert.strictEqual(result.productPk, MOCK_PRODUCT.id);
      assert.strictEqual(result.repos.length, MOCK_REPOS.length);
    } finally {
      server.close();
    }
  });

  test('lança erro quando nenhuma organização encontrada', async () => {
    const {server, baseUrl} = await mockServer((req, res) => {
      json(res, {count: 0, results: []});
    });
    try {
      const s: MsgramSettings = {serviceUrl: baseUrl, token: 'tok', productName: 'P'};
      await assert.rejects(fetchRepositories(s), /Nenhuma organização encontrada/);
    } finally {
      server.close();
    }
  });

  test('lança erro quando produto não encontrado', async () => {
    const {server, baseUrl} = await mockServer((req, res) => {
      if (req.url === '/api/v1/organizations/') {
        return json(res, {count: 1, results: [MOCK_ORG]});
      }
      json(res, {count: 1, results: [{id: 99, name: 'OutroProduto'}]});
    });
    try {
      const s: MsgramSettings = {serviceUrl: baseUrl, token: 'tok', productName: 'MeasureSoftGram'};
      await assert.rejects(fetchRepositories(s), /Produto "MeasureSoftGram" não encontrado/);
    } finally {
      server.close();
    }
  });
});

// ── fetchScoreForRepo ─────────────────────────────────────────────────────────

suite('fetchScoreForRepo', () => {
  test('retorna dados mockados quando sem configuração', async () => {
    const s: MsgramSettings = {serviceUrl: '', token: '', productName: ''};
    const result = await fetchScoreForRepo(s, 0, 0, 0, 'repo');
    assert.ok(result.score > 0);
    assert.ok(result.characteristics.length > 0);
  });

  test('retorna score e características corretos', async () => {
    const {server, baseUrl} = await createFullMockServer();
    try {
      const s: MsgramSettings = {serviceUrl: baseUrl, token: 'tok', productName: 'MeasureSoftGram'};
      const result = await fetchScoreForRepo(s, MOCK_ORG.id, MOCK_PRODUCT.id, 6, 'repo');
      assert.strictEqual(result.score, MOCK_TSQMI.value);
      assert.strictEqual(result.characteristics.length, MOCK_CHARS.length);
      assert.ok(!result.noData);
    } finally {
      server.close();
    }
  });

  test('retorna noData=true quando repositório sem TSQMI calculado', async () => {
    const {server, baseUrl} = await createFullMockServer();
    try {
      const s: MsgramSettings = {serviceUrl: baseUrl, token: 'tok', productName: 'MeasureSoftGram'};
      const result = await fetchScoreForRepo(s, MOCK_ORG.id, MOCK_PRODUCT.id, 9999, 'sem-dados');
      assert.strictEqual(result.noData, true);
      assert.strictEqual(result.score, 0);
    } finally {
      server.close();
    }
  });

  test('lança erro quando API retorna HTTP 401', async () => {
    const {server, baseUrl} = await mockServer((req, res) => {
      json(res, {detail: 'Não autenticado.'}, 401);
    });
    try {
      const s: MsgramSettings = {serviceUrl: baseUrl, token: 'invalido', productName: 'P'};
      await assert.rejects(
          fetchScoreForRepo(s, 1, 1, 1, 'repo'),
          /HTTP 401/,
      );
    } finally {
      server.close();
    }
  });
});
