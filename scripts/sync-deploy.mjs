#!/usr/bin/env node
// 把 web-scraper skill 源同步到 CC 全局 + Codex 项目级部署位置。
// 改完源仓库跑一次 `node scripts/sync-deploy.mjs`，省得手动 cp 到两处。
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CC_DEST = path.join(os.homedir(), '.claude', 'skills', 'web-scraper');
const CODEX_DEST = path.resolve(SRC, '..', '.agents', 'skills', 'web-scraper');

const TARGETS = [
  { name: 'Claude Code 全局', dest: CC_DEST },
  { name: 'Codex 项目级', dest: CODEX_DEST },
];

function syncTo(dest) {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(SRC, dest, {
    recursive: true,
    filter: (src) => path.basename(src) !== '.git',
  });
}

console.log(`源:   ${SRC}`);
for (const t of TARGETS) {
  console.log(`\n→ 同步到 ${t.name}: ${t.dest}`);
  syncTo(t.dest);
  console.log('  ✓');
}
console.log('\n✓ deploy 同步完成');
