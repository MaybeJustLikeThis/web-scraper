import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function getStateDir() {
  if (process.env.WEB_ACCESS_STATE_DIR) return path.resolve(process.env.WEB_ACCESS_STATE_DIR);

  switch (os.platform()) {
    case 'win32': {
      const base = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
      return path.join(base, 'web-access');
    }
    case 'darwin':
      return path.join(os.homedir(), 'Library', 'Application Support', 'web-access');
    default: {
      const base = process.env.XDG_STATE_HOME || path.join(os.homedir(), '.local', 'state');
      return path.join(base, 'web-access');
    }
  }
}

export function ensureStateDir() {
  const dir = getStateDir();
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function getConfigPath() {
  return path.join(ensureStateDir(), 'config.env');
}

export function ensureConfigFromTemplate(templatePath) {
  const configPath = getConfigPath();
  if (fs.existsSync(configPath)) return configPath;
  try {
    fs.copyFileSync(templatePath, configPath);
  } catch {
    fs.writeFileSync(configPath, 'WEB_ACCESS_BROWSER=\n', 'utf8');
  }
  return configPath;
}

export function getProxyTokenPath() {
  return path.join(ensureStateDir(), 'proxy-token');
}

export function ensureProxyToken() {
  const tokenPath = getProxyTokenPath();
  try {
    const existing = fs.readFileSync(tokenPath, 'utf8').trim();
    if (existing) return existing;
  } catch {}

  const token = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(tokenPath, token + '\n', { encoding: 'utf8', mode: 0o600 });
  return token;
}

export function readProxyToken() {
  return ensureProxyToken();
}

export function proxyAuthHeaders() {
  return { 'X-Web-Access-Token': readProxyToken() };
}
