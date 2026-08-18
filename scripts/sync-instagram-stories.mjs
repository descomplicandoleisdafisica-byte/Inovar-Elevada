import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'assets', 'stories');
const DATA_DIR = path.join(ROOT, 'data');

const cleanSecret = (value = '') => String(value)
  .trim()
  .replace(/^Bearer\s+/i, '')
  .replace(/^['"]|['"]$/g, '')
  .trim();

const ACCESS_TOKEN = cleanSecret(process.env.INSTAGRAM_ACCESS_TOKEN);
const USER_ID = cleanSecret(process.env.INSTAGRAM_USER_ID);
const API_VERSION = process.env.INSTAGRAM_API_VERSION || 'v23.0';
const API_BASE = process.env.INSTAGRAM_API_BASE || 'https://graph.facebook.com';

if (!ACCESS_TOKEN || !USER_ID) {
  console.error('Configure INSTAGRAM_ACCESS_TOKEN e INSTAGRAM_USER_ID nos Secrets do GitHub.');
  process.exit(1);
}

await fs.mkdir(OUT_DIR, { recursive: true });
await fs.mkdir(DATA_DIR, { recursive: true });

const graph = async (pathname, params = {}) => {
  const url = new URL(`${API_BASE}/${API_VERSION}/${pathname}`);
  Object.entries({ ...params, access_token: ACCESS_TOKEN }).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url, { headers: { 'User-Agent': 'InovarElevadaSite/1.0' } });
  if (!res.ok) {
    const body = await res.text();
    if (res.status === 400 && /Malformed access token/i.test(body)) {
      throw new Error('Token da Meta inválido ou malformado. Atualize o Secret INSTAGRAM_ACCESS_TOKEN com um Page Access Token real, sem aspas e sem o prefixo Bearer.');
    }
    throw new Error(`Instagram API ${res.status}: ${body}`);
  }
  return res.json();
};

const extFrom = (mediaType, contentType = '') => {
  if (String(mediaType).toUpperCase().includes('VIDEO') || contentType.includes('video')) return '.mp4';
  if (contentType.includes('png')) return '.png';
  if (contentType.includes('webp')) return '.webp';
  return '.jpg';
};

const download = async (url, targetBase, mediaType) => {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Falha ao baixar mídia: ${res.status}`);
  const ext = extFrom(mediaType, res.headers.get('content-type') || '');
  const file = `${targetBase}${ext}`;
  await fs.writeFile(path.join(ROOT, file), Buffer.from(await res.arrayBuffer()));
  return file.replaceAll('\\', '/');
};

for (const name of await fs.readdir(OUT_DIR)) {
  if (name !== '.gitkeep') await fs.rm(path.join(OUT_DIR, name), { force: true });
}

const storiesPayload = await graph(`${USER_ID}/stories`, {
  fields: 'id,media_type,media_url,thumbnail_url,permalink,timestamp'
});

const now = Date.now();
const active = (storiesPayload.data || []).filter(item => {
  if (!item.timestamp) return true;
  return now - new Date(item.timestamp).getTime() < 26 * 60 * 60 * 1000;
});

const items = [];
for (const [index, item] of active.entries()) {
  if (!item.media_url) continue;
  try {
    const safeId = String(item.id || index).replace(/[^a-zA-Z0-9_-]/g, '');
    const src = await download(item.media_url, `assets/stories/story-${safeId}`, item.media_type);
    let thumbnail = null;
    if (item.thumbnail_url && String(item.media_type).toUpperCase().includes('VIDEO')) {
      try { thumbnail = await download(item.thumbnail_url, `assets/stories/story-${safeId}-thumb`, 'IMAGE'); } catch {}
    }
    items.push({
      id: item.id,
      mediaType: item.media_type,
      src,
      thumbnail,
      timestamp: item.timestamp || null,
      permalink: item.permalink || null
    });
  } catch (err) {
    console.warn(`Story ${item.id || index} ignorado:`, err.message);
  }
}

try {
  const profile = await graph(USER_ID, { fields: 'username,profile_picture_url' });
  if (profile.profile_picture_url) {
    const res = await fetch(profile.profile_picture_url, { redirect: 'follow' });
    if (res.ok) {
      await fs.mkdir(path.join(ROOT, 'assets'), { recursive: true });
      await fs.writeFile(path.join(ROOT, 'assets', 'profile.jpg'), Buffer.from(await res.arrayBuffer()));
    }
  }
} catch (err) {
  console.warn('Não foi possível atualizar a foto do perfil:', err.message);
}

await fs.writeFile(path.join(DATA_DIR, 'stories.json'), JSON.stringify({
  updatedAt: new Date().toISOString(),
  account: '@inovarelevada_materiais',
  items
}, null, 2));

console.log(`Sincronização concluída: ${items.length} Story(s) ativo(s).`);
