#!/usr/bin/env bash
# Tarea 1.4 — auditoría de secretos. Correr desde la raíz del repo.
set -uo pipefail

echo "== ¿.env estuvo versionado alguna vez? =="
if git log --all --full-history --oneline -- .env | grep -q .; then
  echo "  ⚠️  SÍ. Commits:"
  git log --all --full-history --oneline -- .env
  echo "  → Rotar TODAS las claves listadas abajo."
else
  echo "  ✅ No aparece en el historial."
fi

echo
echo "== Rastros de claves en el historial =="
for clave in MP_ACCESS_TOKEN CRON_SECRET CLOUDINARY WHATSAPP POSTGRES_URL; do
  hits=$(git rev-list --all | while read c; do
    git grep -l "$clave" "$c" -- '*.ts' '*.tsx' '*.js' '*.json' 2>/dev/null
  done | head -3)
  if [ -n "$hits" ]; then
    echo "  ⚠️  $clave encontrado en:"; echo "$hits" | sed 's/^/      /'
  else
    echo "  ✅ $clave limpio"
  fi
done

echo
echo "== Variables NEXT_PUBLIC_* (visibles en el bundle del cliente) =="
grep -o 'NEXT_PUBLIC_[A-Z_]*' -r app/ --include='*.ts*' | cut -d: -f2 | sort -u | sed 's/^/  /'
echo "  → Verificar que ninguna contenga un secreto: NEXT_PUBLIC_ se inlinea en el JS público."

echo
echo "== Checklist de rotación si algo salió ⚠️ =="
cat <<'EOF'
  [ ] CRON_SECRET                    (regenerar + actualizar en Vercel)
  [ ] Mercado Pago access token      (panel MP → credenciales de producción)
  [ ] Cloudinary API secret
  [ ] Meta/WhatsApp Business token
  [ ] POSTGRES_URL                   (rotar password de la base)
EOF
