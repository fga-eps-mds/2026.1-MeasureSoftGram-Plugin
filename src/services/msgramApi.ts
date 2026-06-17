import * as https from 'https';
import * as http from 'http';

export type Logger = (message: string) => void;

export interface MsgramSettings {
  serviceUrl: string;
  token: string;
  productName: string;
}

export interface RepoItem {
  id: number;
  name: string;
}

export interface RepoContext {
  orgPk: number;
  productPk: number;
  repos: RepoItem[];
}

export interface Characteristic {
  name: string;
  value: number;
  goal: number;
}

export interface ScoreData {
  score: number;
  characteristics: Characteristic[];
  noData?: boolean;
}

// ── Mock ─────────────────────────────────────────────────────────────────────

const MOCK_REPOS: RepoItem[] = [
  { id: 1, name: 'mock-repo-frontend' },
  { id: 2, name: 'mock-repo-backend' },
];

const MOCK_SCORE: ScoreData = {
  score: 0.94,
  characteristics: [
    { name: 'Reliability',     value: 0.82, goal: 0.80 },
    { name: 'Maintainability', value: 0.68, goal: 0.75 },
    { name: 'Security',        value: 0.71, goal: 0.70 },
  ],
};

// ── HTTP helpers ──────────────────────────────────────────────────────────────

function get<T>(url: string, token: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const client = new URL(url).protocol === 'https:' ? https : http;
    const req = client.request(
      url,
      { method: 'GET', headers: { Authorization: `Token ${token}` } },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${raw}`));
          } else {
            try { resolve(JSON.parse(raw)); }
            catch { reject(new Error(`JSON inválido: ${raw}`)); }
          }
        });
      },
    );
    req.on('error', reject);
    req.end();
  });
}

function post<T>(url: string, body: object, token?: string): Promise<T> {
  const payload = JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const client = new URL(url).protocol === 'https:' ? https : http;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Content-Length': String(Buffer.byteLength(payload)),
    };
    if (token) { headers['Authorization'] = `Token ${token}`; }
    const req = client.request(url, { method: 'POST', headers }, (res) => {
      let raw = '';
      res.on('data', (c) => (raw += c));
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${raw}`));
        } else {
          try { resolve(JSON.parse(raw)); }
          catch { reject(new Error(`JSON inválido: ${raw}`)); }
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ── Timestamp ─────────────────────────────────────────────────────────────────

function ts(): string {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function login(
  serviceUrl: string,
  username: string,
  password: string,
): Promise<string> {
  const res = await post<{ key: string }>(
    `${serviceUrl}/api/v1/accounts/login/`,
    { username, password },
  );
  return res.key;
}

// ── Internal types ────────────────────────────────────────────────────────────

interface OrgItem     { id: number; name: string }
interface ProductItem { id: number; name: string }
interface TsqmiResp   { value: number }
interface CharItem    { name: string; latest: { value: number } }

// ── Repositories ──────────────────────────────────────────────────────────────

export async function fetchRepositories(
  settings: MsgramSettings,
  log: Logger = () => {},
): Promise<RepoContext> {
  if (!settings.serviceUrl || !settings.token) {
    log(`[${ts()}] Sem configuração — usando repositórios mockados.`);
    return { orgPk: 0, productPk: 0, repos: MOCK_REPOS };
  }

  const { serviceUrl, token, productName } = settings;

  const orgsUrl = `${serviceUrl}/api/v1/organizations/`;
  log(`[${ts()}] GET ${orgsUrl}`);
  const orgs = await get<{ results: OrgItem[] }>(orgsUrl, token);
  if (!orgs.results.length) { throw new Error('Nenhuma organização encontrada.'); }
  const orgPk = orgs.results[0].id;
  log(`[${ts()}] → Organização: "${orgs.results[0].name}" (id=${orgPk})`);

  const productsUrl = `${serviceUrl}/api/v1/organizations/${orgPk}/products/`;
  log(`[${ts()}] GET ${productsUrl}`);
  const products = await get<{ results: ProductItem[] }>(productsUrl, token);
  const product = products.results.find(
    (p) => p.name.toLowerCase() === productName.toLowerCase(),
  );
  if (!product) { throw new Error(`Produto "${productName}" não encontrado.`); }
  log(`[${ts()}] → Produto: "${product.name}" (id=${product.id})`);

  const reposUrl = `${serviceUrl}/api/v1/organizations/${orgPk}/products/${product.id}/repositories/`;
  log(`[${ts()}] GET ${reposUrl}`);
  const reposRes = await get<{ results: RepoItem[] }>(reposUrl, token);
  log(`[${ts()}] → ${reposRes.results.length} repositório(s): ${reposRes.results.map(r => r.name).join(', ')}`);

  return { orgPk, productPk: product.id, repos: reposRes.results };
}

// ── Score por repositório ─────────────────────────────────────────────────────

export async function fetchScoreForRepo(
  settings: MsgramSettings,
  orgPk: number,
  productPk: number,
  repoPk: number,
  repoName: string,
  log: Logger = () => {},
): Promise<ScoreData> {
  if (!settings.serviceUrl || !settings.token) {
    log(`[${ts()}] Sem configuração — usando score mockado.`);
    return MOCK_SCORE;
  }

  const base = `${settings.serviceUrl}/api/v1/organizations/${orgPk}/products/${productPk}/repositories/${repoPk}`;
  const tsqmiUrl = `${base}/latest-values/tsqmi/`;
  const charsUrl = `${base}/latest-values/characteristics/`;

  log(`[${ts()}] Buscando métricas para repositório "${repoName}" (id=${repoPk})`);
  log(`[${ts()}] GET ${tsqmiUrl}`);
  log(`[${ts()}] GET ${charsUrl}`);

  const [tsqmi, chars] = await Promise.all([
    get<TsqmiResp>(tsqmiUrl, settings.token),
    get<{ results: CharItem[] }>(charsUrl, settings.token),
  ]);

  if (tsqmi.value == null) {
    log(`[${ts()}] Repositório "${repoName}" ainda não possui TSQMI calculado.`);
    return { score: 0, characteristics: [], noData: true };
  }

  log(`[${ts()}] → TSQMI: ${tsqmi.value.toFixed(4)}`);
  chars.results.forEach(c => log(`[${ts()}] → ${c.name}: ${c.latest.value.toFixed(4)}`));

  return {
    score: tsqmi.value,
    characteristics: chars.results.map((c) => ({
      name:  c.name,
      value: c.latest.value,
      goal:  0.7,
    })),
  };
}
