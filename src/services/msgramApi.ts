import * as https from 'https';
import * as http from 'http';

export type Logger = (message: string) => void;

export interface MsgramSettings {
  serviceUrl: string;
  token: string;
  productName: string;
}

export interface Characteristic {
  name: string;
  value: number;
  goal: number;
}

export interface ScoreData {
  score: number;
  characteristics: Characteristic[];
}

// ── Mock ─────────────────────────────────────────────────────────────────────

const MOCK_DATA: ScoreData = {
  score: 0.74,
  characteristics: [
    { name: 'Reliability',      value: 0.82, goal: 0.80 },
    { name: 'Maintainability',  value: 0.68, goal: 0.75 },
    { name: 'Security',         value: 0.71, goal: 0.70 },
  ],
};

// ── HTTP helper ───────────────────────────────────────────────────────────────

function get<T>(url: string, token: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const client = parsed.protocol === 'https:' ? https : http;

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
            catch { reject(new Error(`Invalid JSON: ${raw}`)); }
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
    const parsed = new URL(url);
    const client = parsed.protocol === 'https:' ? https : http;

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
          catch { reject(new Error(`Invalid JSON: ${raw}`)); }
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
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

// ── Quality data ──────────────────────────────────────────────────────────────

interface OrgItem { id: number; name: string }
interface ProductItem { id: number; name: string }
interface RepoItem { id: number; name: string }
interface TsqmiResponse { value: number }
interface CharItem { name: string; latest: { value: number } }

function timestamp(): string {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

async function findOrg(serviceUrl: string, token: string, log: Logger): Promise<number> {
  const url = `${serviceUrl}/api/v1/organizations/`;
  log(`[${timestamp()}] GET ${url}`);
  const res = await get<{ results: OrgItem[] }>(url, token);
  log(`[${timestamp()}] → ${res.results.length} organização(ões) encontrada(s): ${res.results.map(o => o.name).join(', ')}`);
  if (!res.results.length) { throw new Error('Nenhuma organização encontrada.'); }
  return res.results[0].id;
}

async function findProduct(
  serviceUrl: string,
  token: string,
  orgPk: number,
  productName: string,
  log: Logger,
): Promise<number> {
  const url = `${serviceUrl}/api/v1/organizations/${orgPk}/products/`;
  log(`[${timestamp()}] GET ${url}`);
  const res = await get<{ results: ProductItem[] }>(url, token);
  log(`[${timestamp()}] → ${res.results.length} produto(s): ${res.results.map(p => p.name).join(', ')}`);
  const found = res.results.find(
    (p) => p.name.toLowerCase() === productName.toLowerCase(),
  );
  if (!found) { throw new Error(`Produto "${productName}" não encontrado.`); }
  log(`[${timestamp()}] → Produto selecionado: "${found.name}" (id=${found.id})`);
  return found.id;
}

async function findFirstRepo(
  serviceUrl: string,
  token: string,
  orgPk: number,
  productPk: number,
  log: Logger,
): Promise<number> {
  const url = `${serviceUrl}/api/v1/organizations/${orgPk}/products/${productPk}/repositories/`;
  log(`[${timestamp()}] GET ${url}`);
  const res = await get<{ results: RepoItem[] }>(url, token);
  log(`[${timestamp()}] → ${res.results.length} repositório(s): ${res.results.map(r => r.name).join(', ')}`);
  if (!res.results.length) { throw new Error('Nenhum repositório encontrado.'); }
  log(`[${timestamp()}] → Repositório selecionado: "${res.results[0].name}" (id=${res.results[0].id})`);
  return res.results[0].id;
}

export async function fetchScoreData(settings: MsgramSettings, log: Logger = () => {}): Promise<ScoreData> {
  if (!settings.serviceUrl || !settings.token) {
    log(`[${timestamp()}] Sem serviceUrl/token configurados — usando dados mockados.`);
    return MOCK_DATA;
  }

  const { serviceUrl, token, productName } = settings;
  const base = `${serviceUrl}/api/v1/organizations`;

  log(`[${timestamp()}] Iniciando busca de qualidade para produto "${productName}"...`);

  const orgPk     = await findOrg(serviceUrl, token, log);
  const productPk = await findProduct(serviceUrl, token, orgPk, productName, log);
  const repoPk    = await findFirstRepo(serviceUrl, token, orgPk, productPk, log);
  const repoBase  = `${base}/${orgPk}/products/${productPk}/repositories/${repoPk}`;

  const tsqmiUrl = `${repoBase}/latest-values/tsqmi/`;
  const charsUrl = `${repoBase}/latest-values/characteristics/`;
  log(`[${timestamp()}] GET ${tsqmiUrl}`);
  log(`[${timestamp()}] GET ${charsUrl}`);

  const [tsqmi, chars] = await Promise.all([
    get<TsqmiResponse>(tsqmiUrl, token),
    get<{ results: CharItem[] }>(charsUrl, token),
  ]);

  log(`[${timestamp()}] → TSQMI: ${tsqmi.value.toFixed(4)}`);
  chars.results.forEach(c => log(`[${timestamp()}] → ${c.name}: ${c.latest.value.toFixed(4)}`));

  return {
    score: tsqmi.value,
    characteristics: chars.results.map((c) => ({
      name:  c.name,
      value: c.latest.value,
      goal:  0.7,
    })),
  };
}
