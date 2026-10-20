#!/usr/bin/env bash
# Tarea 2.4 — borrar la herencia del template Next.js Learn.
# Correr desde la raíz del repo, con el árbol de git limpio.
set -euo pipefail

echo "== Verificando que nada importe estos archivos =="
HUERFANOS=(
  "app/ui/acme-logo"
  "app/ui/invoices"
  "app/ui/customers"
  "app/ui/dashboard/sidenav"
  "app/ui/dashboard/nav-links"
  "app/ui/dashboard/revenue-chart"
  "app/ui/dashboard/latest-invoices"
  "app/ui/dashboard/cards"
  "app/ui/skeletons"
  "app/lib/data"
  "app/lib/placeholder-data"
)

FALLO=0
for f in "${HUERFANOS[@]}"; do
  # buscamos imports fuera del propio directorio del archivo
  USOS=$(grep -rln "$f" app/ components/ --include='*.ts*' 2>/dev/null | grep -v "^$f" || true)
  if [ -n "$USOS" ]; then
    echo "  ⚠️  $f todavía se importa desde:"; echo "$USOS" | sed 's/^/      /'
    FALLO=1
  else
    echo "  ✅ $f sin usos"
  fi
done

if [ "$FALLO" -eq 1 ]; then
  echo
  echo "Resolvé esos imports antes de borrar. Nada fue eliminado."
  exit 1
fi

echo
echo "== Borrando =="
git rm -r --quiet \
  app/ui/acme-logo.tsx \
  app/ui/invoices \
  app/ui/customers \
  app/ui/dashboard/sidenav.tsx \
  app/ui/dashboard/nav-links.tsx \
  app/ui/dashboard/revenue-chart.tsx \
  app/ui/dashboard/latest-invoices.tsx \
  app/ui/dashboard/cards.tsx \
  app/lib/data.ts \
  app/lib/placeholder-data.js \
  scripts/seed.js \
  public/customers \
  public/hero-desktop.png \
  public/hero-mobile.png

echo "  ✅ listo"
echo
echo "== Dependencias que quedan sin uso =="
echo "  npm uninstall @vercel/postgres bcrypt @types/bcrypt"
echo "  (eran solo del seed y de lib/data.ts — el auth real está en la API Express)"
echo
echo "Verificar: npm run build && npm run typecheck"
