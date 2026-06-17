#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

function fail(message) {
  errors.push(message);
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function walk(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((entry) => {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(rel);
    return [rel];
  });
}

function checkSkillMarkdown() {
  const text = read('SKILL.md');
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) {
    fail('SKILL.md is missing YAML frontmatter');
    return;
  }
  const lines = fm[1].split(/\r?\n/).filter(Boolean);
  const keys = lines.map((line) => line.split(':')[0]);
  const allowed = new Set(['name', 'description']);
  for (const key of keys) {
    if (!allowed.has(key)) fail(`SKILL.md frontmatter has unsupported key: ${key}`);
  }
  if (!lines.includes('name: web-scraper')) fail('SKILL.md frontmatter must include name: web-scraper');
  const desc = (lines.find((line) => line.startsWith('description: '))?.slice('description: '.length) || '').replace(/^["']|["']$/g, '');
  if (!desc.startsWith('Use when ')) fail('description must start with "Use when "');
  if (desc.length > 500) fail(`description is too long (${desc.length} chars)`);
  if (text.split(/\r?\n/).length > 500) fail('SKILL.md should stay under 500 lines');
}

function checkStructure() {
  if (!exists('agents/openai.yaml')) fail('agents/openai.yaml is missing');
  if (!exists('scripts/state.mjs')) fail('scripts/state.mjs is missing');
  if (!exists('scripts/validate-skill.mjs')) fail('scripts/validate-skill.mjs is missing');
}

function checkJson(rel) {
  try {
    JSON.parse(read(rel));
  } catch (error) {
    fail(`${rel} is not valid JSON: ${error.message}`);
  }
}

function checkBannedText() {
  const banned = [
    ['Complete web browsing', ' and automation skill for Claude Code'].join(''),
    ['v2.5.2', ' 能力'].join(''),
    ['~/.claude', '/skills'].join(''),
    ['/tmp', '/shot.png'].join(''),
    ['继续操作', '即视为接受'].join(''),
  ];
  for (const rel of walk('.')) {
    if (rel.includes(`${path.sep}.git${path.sep}`)) continue;
    const abs = path.join(ROOT, rel);
    let text;
    try {
      text = fs.readFileSync(abs, 'utf8');
    } catch {
      continue;
    }
    for (const phrase of banned) {
      if (text.includes(phrase)) fail(`${rel} contains banned legacy text: ${phrase}`);
    }
  }
}

function checkScripts() {
  for (const rel of walk('scripts').filter((file) => file.endsWith('.mjs'))) {
    const result = spawnSync(process.execPath, ['--check', path.join(ROOT, rel)], { encoding: 'utf8' });
    if (result.status !== 0) {
      fail(`${rel} failed node --check:\n${result.stderr || result.stdout}`);
    }
  }
}

checkSkillMarkdown();
checkStructure();
checkJson('.claude-plugin/plugin.json');
checkJson('.claude-plugin/marketplace.json');
checkBannedText();
checkScripts();

if (errors.length) {
  console.error(`web-scraper skill validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('web-scraper skill validation passed');
