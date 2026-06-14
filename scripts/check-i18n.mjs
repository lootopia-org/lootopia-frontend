#!/usr/bin/env node
/**
 * Validates next-intl translation keys against lootopia-frontend/locales JSON.
 * Run: node scripts/check-i18n.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(__dirname, '..');
const SRC = path.join(APP, 'src');
const LOCALES = path.join(APP, 'locales');
const LOCALES_LIST = ['en', 'fr'];

function loadMessages(locale) {
  const namespaces = ['common', 'auth', 'hunts', 'admin', 'partner', 'validation'];
  const messages = {};
  for (const ns of namespaces) {
    const file = path.join(LOCALES, locale, `${ns}.json`);
    messages[ns] = JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  return messages;
}

function resolveKey(messages, fullKey) {
  const parts = fullKey.split('.');
  const ns = parts[0];
  let node = messages[ns];
  if (!node) return { ok: false, reason: 'missing namespace' };

  for (let i = 1; i < parts.length; i++) {
    if (node == null || typeof node !== 'object') {
      return { ok: false, reason: 'path ends at non-object' };
    }
    node = node[parts[i]];
  }

  if (node === undefined) return { ok: false, reason: 'missing key' };
  if (typeof node === 'object') return { ok: false, reason: 'key is object, not string' };
  return { ok: true };
}

function walkDir(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkDir(full, files);
    else if (/\.(tsx|ts)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function extractUsages(file) {
  const content = fs.readFileSync(file, 'utf8');
  const usages = [];

  const nsRegex = /useTranslations\(\s*['"`]([^'"`]+)['"`]\s*\)|getTranslations\(\s*['"`]([^'"`]+)['"`]\s*\)|getTranslations\(\{\s*[^}]*namespace:\s*['"`]([^'"`]+)['"`]/g;
  let nsMatch;
  const namespaces = [];
  while ((nsMatch = nsRegex.exec(content)) !== null) {
    namespaces.push(nsMatch[1] || nsMatch[2] || nsMatch[3]);
  }

  // getTranslations({ locale, namespace: 'common' }) + t('metadata.title')
  const getWithNs = content.match(/getTranslations\(\{\s*locale[^}]*namespace:\s*['"`]([^'"`]+)['"`]/);
  if (getWithNs) namespaces.push(getWithNs[1]);

  if (namespaces.length === 0) return usages;

  const keyRegex = /\bt(?:Common|Nav|Auth|Aria|Diff|Hunts|Delete|Tooltips|Login|V)?\(\s*['"`]([^'"`]+)['"`]/g;
  let keyMatch;
  while ((keyMatch = keyRegex.exec(content)) !== null) {
    const key = keyMatch[1];
    if (key.includes('${') || key.includes('stepTypeOptions.') || key.includes('stepTypes.')) continue;
    if (key.startsWith('status.') || key.startsWith('duration.') || key.startsWith('difficulty.') || key.startsWith('actions.')) {
      for (const ns of namespaces.filter((n) => n === 'common' || n.startsWith('common.'))) {
        usages.push({ file, namespace: ns.startsWith('common') ? 'common' : ns.split('.')[0], key: ns.includes('.') ? `${ns.split('.').slice(1).join('.')}.${key}` : key, raw: `${ns}.${key}` });
      }
      continue;
    }
    for (const ns of namespaces) {
      usages.push({ file, namespace: ns.split('.')[0], key: ns.includes('.') ? `${ns.split('.').slice(1).join('.')}.${keyMatch[1]}` : keyMatch[1], raw: `${ns}.${keyMatch[1]}` });
    }
  }

  return usages;
}

const files = walkDir(SRC);
const allUsages = files.flatMap(extractUsages);
const unique = new Map();
for (const u of allUsages) {
  unique.set(`${u.raw}|${u.file}`, u);
}

let errors = 0;
for (const locale of LOCALES_LIST) {
  const messages = loadMessages(locale);
  console.log(`\n=== ${locale.toUpperCase()} ===`);
  const missing = new Map();

  for (const usage of unique.values()) {
    const fullKey = usage.namespace === usage.raw.split('.')[0]
      ? `${usage.namespace}.${usage.key}`
      : usage.raw.replace(/^([^.]+\.[^.]+)\./, (_, prefix) => {
          const ns = prefix.split('.')[0];
          const rest = prefix.split('.').slice(1).join('.');
          return rest ? `${ns}.${rest}.` : `${ns}.`;
        });

    // Reconstruct: namespace from useTranslations is full prefix
    const parts = usage.raw.split('.');
    const ns = parts[0];
    const keyPath = parts.slice(1).join('.');
    const result = resolveKey(messages, `${ns}.${keyPath}`);

    if (!result.ok) {
      const id = usage.raw;
      if (!missing.has(id)) missing.set(id, { reason: result.reason, files: new Set() });
      missing.get(id).files.add(path.relative(SRC, usage.file));
      errors++;
    }
  }

  for (const [key, info] of [...missing.entries()].sort()) {
    console.log(`  MISSING (${info.reason}): ${key}`);
    for (const f of info.files) console.log(`    - ${f}`);
  }
}

if (errors > 0) {
  console.log(`\n${errors} missing translation reference(s) found.`);
  process.exit(1);
}

console.log('\nAll translation keys resolve correctly.');
