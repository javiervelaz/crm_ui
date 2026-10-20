#!/usr/bin/env node
/**
 * Codemod de la tarea 1.3 — limpieza de console.*
 *
 *   node scripts/limpiar-logs.js --dry     ← reporte, no toca nada
 *   node scripts/limpiar-logs.js           ← aplica los cambios
 *
 * Qué hace, archivo por archivo, bajo app/ y components/:
 *   1. Elimina las sentencias console.log / console.debug de una sola línea.
 *   2. Reescribe console.error(...) y console.warn(...) a logError / logWarn.
 *   3. Agrega el import de '@/app/lib/logger' si hizo falta.
 *
 * NO toca lo que quedó comentado ni los console.* multilínea: los lista al final
 * para revisión manual. Correr con el árbol de git limpio y revisar el diff.
 */
const fs = require('fs');
const path = require('path');

const ROOTS = ['app', 'components'];
const DRY = process.argv.includes('--dry');
const EXT = /\.(ts|tsx)$/;

let borrados = 0, reescritos = 0, archivos = 0;
const manual = [];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      walk(p, out);
    } else if (EXT.test(entry.name)) out.push(p);
  }
  return out;
}

for (const root of ROOTS) {
  if (!fs.existsSync(root)) continue;

  for (const file of walk(root)) {
    const original = fs.readFileSync(file, 'utf8');
    const lines = original.split('\n');
    const salida = [];
    let usaError = false, usaWarn = false, cambio = false;

    for (const line of lines) {
      // console.* que no cierra en la misma línea → revisión manual
      if (/console\.(log|warn|error|debug)\s*\(/.test(line) &&
          !/^\s*\/\//.test(line) &&
          (line.match(/\(/g) || []).length !== (line.match(/\)/g) || []).length) {
        manual.push(`${file}: ${line.trim()}`);
        salida.push(line);
        continue;
      }

      // 1. borrar console.log / console.debug de una línea
      if (/^\s*console\.(log|debug)\s*\(.*\);?\s*$/.test(line)) {
        borrados++; cambio = true;
        continue;
      }

      // 2. console.error / console.warn → helpers
      if (/console\.error\s*\(/.test(line) && !/^\s*\/\//.test(line)) {
        salida.push(line.replace(/console\.error\s*\(/g, 'logError('));
        usaError = true; reescritos++; cambio = true;
        continue;
      }
      if (/console\.warn\s*\(/.test(line) && !/^\s*\/\//.test(line)) {
        salida.push(line.replace(/console\.warn\s*\(/g, 'logWarn('));
        usaWarn = true; reescritos++; cambio = true;
        continue;
      }

      salida.push(line);
    }

    if (!cambio) continue;

    let texto = salida.join('\n');

    // 3. import del logger
    const necesita = [usaError && 'logError', usaWarn && 'logWarn'].filter(Boolean);
    if (necesita.length && !texto.includes("from '@/app/lib/logger'")) {
      const imp = `import { ${necesita.join(', ')} } from '@/app/lib/logger';`;
      const primerImport = texto.search(/^import /m);
      if (primerImport !== -1) {
        texto = texto.slice(0, primerImport) + imp + '\n' + texto.slice(primerImport);
      } else {
        // archivos que arrancan con 'use client'
        texto = texto.replace(/^((['"])use client\2;?\n)/, `$1\n${imp}\n`);
      }
    }

    archivos++;
    if (!DRY) fs.writeFileSync(file, texto, 'utf8');
  }
}

console.log(`\n${DRY ? '[dry-run] ' : ''}${archivos} archivos · ${borrados} console.log borrados · ${reescritos} reescritos a logger`);
if (manual.length) {
  console.log(`\n${manual.length} console.* multilínea para revisar a mano:`);
  manual.forEach((m) => console.log('  ' + m));
}
