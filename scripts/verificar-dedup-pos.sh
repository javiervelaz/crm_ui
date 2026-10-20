#!/usr/bin/env bash
# Tarea 3.1 — verificacion previa a la deduplicacion del POS.
# Confirma que archivos son identicos (merge trivial) y cuales divergieron.
set -uo pipefail

CAJA="app/dashboard/operaciones/caja/components"
EMP="app/dashboard/operaciones/empleado/caja/components"

echo "== Comparacion de las dos copias del POS =="
printf "%-24s %-8s %-10s %s\n" "ARCHIVO" "CAJA" "EMPLEADO" "ESTADO"

for f in PedidoForm.tsx PedidosGrid.tsx DashboardEmpleados.tsx abrirCajaForm.tsx Modal.tsx; do
  A="$CAJA/$f"; B="$EMP/$f"
  if [ ! -f "$A" ] && [ ! -f "$B" ]; then continue; fi
  if [ ! -f "$A" ]; then printf "%-24s %-8s %-10s %s\n" "$f" "-" "$(wc -l < "$B")" "solo empleado"; continue; fi
  if [ ! -f "$B" ]; then printf "%-24s %-8s %-10s %s\n" "$f" "$(wc -l < "$A")" "-" "solo caja"; continue; fi

  LA=$(wc -l < "$A"); LB=$(wc -l < "$B")
  if diff -q "$A" "$B" >/dev/null; then
    ESTADO="IDENTICOS -> merge trivial"
  else
    ESTADO="DIVERGIERON -> $(diff "$A" "$B" | grep -c "^[<>]") lineas distintas"
  fi
  printf "%-24s %-8s %-10s %s\n" "$f" "$LA" "$LB" "$ESTADO"
done

echo
echo "== Diff completo de los que divergieron =="
for f in PedidosGrid.tsx DashboardEmpleados.tsx abrirCajaForm.tsx; do
  if [ -f "$CAJA/$f" ] && [ -f "$EMP/$f" ] && ! diff -q "$CAJA/$f" "$EMP/$f" >/dev/null; then
    echo; echo "--- $f ---"
    diff -u "$CAJA/$f" "$EMP/$f" | head -80
  fi
done

echo
echo "Clasifica cada diferencia antes de unificar:"
echo "  [A] bug arreglado en una sola copia -> adoptar"
echo "  [B] diferencia legitima por rol     -> pasa a prop"
echo "  [C] ruido / divergencia accidental  -> descartar"
