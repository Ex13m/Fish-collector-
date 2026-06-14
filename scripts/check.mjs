#!/usr/bin/env node
/* Проверка целостности FISH COLLECTOR: синтаксис inline-JS + синхронность версий index.html/sw.js. */
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync('index.html', 'utf8');
const sw = fs.readFileSync('sw.js', 'utf8');

// 1) синтаксис всего inline <script>
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n;\n');
try { new vm.Script(scripts); } catch (e) { console.error('✗ Синтаксис JS в index.html:', e.message); process.exit(1); }

// 2) версии должны совпадать
const appV = (html.match(/APP_VERSION\s*=\s*'([^']+)'/) || [])[1];
const swV = (sw.match(/fishcollector-v([0-9.]+)/) || [])[1];
if (!appV || !swV) { console.error('✗ Не нашёл версию в index.html или sw.js'); process.exit(1); }
if (appV !== swV) { console.error(`✗ Версии расходятся: index.html=${appV} sw.js=${swV} (скил bump-version)`); process.exit(1); }

console.log(`✓ FISH COLLECTOR check OK — JS валиден, версия ${appV} синхронна.`);
