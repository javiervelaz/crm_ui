#!/usr/bin/env node
/**
 * Codemod de la tarea 2.2 — sacar useAuthCheck() de las páginas hijas.
 *
 *   node scripts/quitar-useauthcheck.js --dry
 *   node scripts/quitar-useauthcheck.js
 *
 * El guard ahora vive en app/dashboard/layout.tsx. Este script:
 *   1. Borra las llamadas sueltas  useAuthCheck();
 *   2. Marca con un TODO los  const { loading } = useAuthCheck();  — esos
 *      arrastran un bloque if (loading) return <skeleton/> que hay que sacar
 *      a mano, porque cada página lo escribió distinto.
 *   3. Borra el import si quedó sin uso.
 *
 * NO toca app/dashboard/layout.tsx ni app/page.tsx.
 */
const fs = require('fs');
const path = require('path');

const DRY = process.argv.includes('--dry');
const SKIP = ['app/dashboard/layout.tsx', 'app/page.tsx', 'app/lib/useAuthCheck.ts'];

let borradas = 0, marcadas = 0, imports = 0;
const revisar = [];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
      walk(p, out);
    } else if (/\.tsx?$/.test(e.name)) out.push(p);
  }
  return out;
}

for (const file of walk('app')) {
  if (SKIP.some((s) => file.endsWith(s.replace('app/', '')) && file.includes(path.dirname(s)))) continue;
  if (SKIP.includes(file.split(path.sep).join('/'))) continue;

  const original = fs.readFileSync(file, 'utf8');
  if (!original.includes('useAuthCheck')) continue;

  let texto = original;

  // 1. llamada suelta, sin destructuring
  texto = texto.replace(/^[ \t]*useAuthCheck\(\);[ \t]*\n/gm, () => {
    borradas++;
    return '';
  });

  // 2. con destructuring → marcar, no borrar
  texto = texto.replace(
    /^([ \t]*)(const\s*\{[^}]*\}\s*=\s*useAuthCheck\(\);)/gm,
    (_m, indent, decl) => {
      marcadas++;
      revisar.push(file);
      return `${indent}// TODO(2.2): el guard vive en app/dashboard/layout.tsx.\n` +
             `${indent}// Borrar esta línea Y el bloque if (loading) return <skeleton/> de abajo.\n` +
             `${indent}${decl}`;
    }
  );

  // 3. import huérfano
  if (!/useAuthCheck\s*\(/.test(texto)) {
    const antes = texto;
    texto = texto
      .replace(/^import\s+useAuthCheck\s+from\s+['"][^'"]*useAuthCheck['"];?\n/gm, '')
      .replace(/^import\s*\{\s*useAuthCheck\s*\}\s*from\s+['"][^'"]*useAuthCheck['"];?\n/gm, '');
    if (texto !== antes) imports++;
  }

  if (texto !== original && !DRY) fs.writeFileSync(file, texto, 'utf8');
}

console.log(`\n${DRY ? '[dry-run] ' : ''}${borradas} llamadas borradas · ${marcadas} marcadas con TODO · ${imports} imports limpiados`);
if (revisar.length) {
  console.log('\nRevisar a mano (tienen skeleton propio):');
  [...new Set(revisar)].forEach((f) => console.log('  ' + f));
}
