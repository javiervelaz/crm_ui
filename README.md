# 3.3 — Las otras duplicaciones

> **Antes de copiar:** las carpetas `[id]` no sobreviven al empaquetado y quedaron
> como `-id-`. Renombralas al copiar:
>
> ```bash
> app/dashboard/gasto/-id-/edit/page.tsx                     → app/dashboard/gasto/[id]/edit/page.tsx
> app/dashboard/tipo-salida/-id-/edit/page.tsx               → app/dashboard/tipo-salida/[id]/edit/page.tsx
> app/dashboard/productos/tipo-producto/-id-/edit/page.tsx   → app/dashboard/productos/tipo-producto/[id]/edit/page.tsx
> app/dashboard/tipo-producto/-id-/edit/page.tsx             → app/dashboard/tipo-producto/[id]/edit/page.tsx
> ```

## El plan decía tres casos. Son dos.

| Caso | Lo que decía el plan | Lo que hay en el código |
|---|---|---|
| `tipo-salida` vs `gasto` | dos copias divergentes | **una copia viva + una muerta** |
| `tipo-producto` vs `productos/tipo-producto` | dos copias divergentes | **una copia viva + una muerta** |
| reportes | duplicados | **no es duplicación** — ver abajo |

### Reportes: falsa alarma

`dashboard/reportes/reportes/*/page.tsx` son envoltorios de ruta de ~20 líneas que
importan los componentes de `ui/dashboard/operaciones/admin/components/reportes/`:

```tsx
import ReporteVentasPage from '@/app/ui/dashboard/operaciones/admin/components/reportes/reporteVentas';
```

Existe **una sola copia** de cada reporte. Sacar reportes del alcance de 3.3; su
migración a `ResponsiveTable` es 4.3 y nada más.

---

## El hallazgo que cambia todo: ambas rutas renderizan la copia equivocada

No son dos copias que divergieron. Es **una copia viva y otra muerta** — y los
imports cruzan de árbol:

```tsx
// app/dashboard/gasto/page.tsx        ← ruta del módulo Gastos
import ProductosPage from '@/app/dashboard/tipo-salida/componentes/tipoSalidaPage';
//                                        ↑ importa del OTRO árbol

// app/dashboard/gasto/create/page.tsx
import CreateTipoSalidaForm from '@/app/dashboard/tipo-salida/componentes/createTipoSalidaForm';

// app/dashboard/productos/tipo-producto/page.tsx
import TipoProductosPage from '@/app/dashboard/tipo-producto/componentes/tipoProductoPage';
//                                        ↑ ídem
```

Consecuencias, en orden de gravedad:

**1. La migración de 4.3 nunca se ejecutó.** `gasto/componentes/TipoSalidaTable.tsx`
—el que migré a `ResponsiveTable`— está en una carpeta que **nadie importa**. Las
dos rutas renderizan la tabla vieja. Esto corrige lo que dije en la verificación
v2: no es que "el mismo dato se ve distinto según la ruta"; es que **se ve viejo
en las dos**, y el trabajo nuevo es invisible.

**2. Toda la carpeta `gasto/componentes/` es código muerto.** Cinco archivos.
Igual que `productos/tipo-producto/componentes/` (dos archivos).

**3. El usuario rebota entre los dos árboles.** En categorías de producto, el
componente vivo tiene:

```tsx
router.push('/dashboard/productos/tipo-producto/create')  // botón Crear
router.push(`/dashboard/tipo-producto/${id}/edit`)        // botón Editar
```

Crear y editar viven en árboles distintos. Con el guard de la fase 2 activo, el
acceso depende de qué módulos tenga el usuario en el token: **si tiene
`productos` pero no `tipo-producto`, el botón Editar lo saca a la pantalla
*Sin acceso*.**

**4. Cuatro formularios que son el mismo.** Los dos `create/page.tsx` leen
`useParams()` para un `id` que en una ruta de creación no existe nunca: la rama de
edición es inalcanzable. Los dos `[id]/edit/page.tsx` tienen la rama de creación
muerta por el motivo simétrico. Nadie puede crear una categoría de gasto desde
`/dashboard/gasto/create` con el tipo asignado, porque ese formulario no tiene el
select de tipo — solo el de edición lo tiene.

---

## Decisión: gana la ubicación anidada bajo su módulo

Coincide con lo que `modules.ts` ya declara y con el menú:

| Concepto | Canónico | Se borra |
|---|---|---|
| Categorías de gasto | `app/dashboard/gasto/` | `app/dashboard/tipo-salida/` |
| Categorías de producto | `app/dashboard/productos/tipo-producto/` | `app/dashboard/tipo-producto/` |

---

## Archivos

### Caso A — Categorías de gasto

| Archivo | Acción |
|---|---|
| `app/dashboard/gasto/page.tsx` | **sobrescribir** — import corregido, sin guard propio |
| `app/dashboard/gasto/componentes/tipoSalidaPage.tsx` | **sobrescribir** — canónico |
| `app/dashboard/gasto/componentes/searchTipoSalida.tsx` | **sobrescribir** — lucide |
| `app/dashboard/gasto/componentes/CategoriaGastoForm.tsx` | **nuevo** — form único |
| `app/dashboard/gasto/create/page.tsx` | **sobrescribir** |
| `app/dashboard/gasto/[id]/edit/page.tsx` | **sobrescribir** — de 140 a 12 líneas |
| `app/dashboard/tipo-salida/page.tsx` | **sobrescribir** — redirect |
| `app/dashboard/tipo-salida/create/page.tsx` | **sobrescribir** — redirect |
| `app/dashboard/tipo-salida/[id]/edit/page.tsx` | **sobrescribir** — redirect |
| `app/dashboard/gasto/componentes/TipoSalidaTable.tsx` | **dejar como está** — ya migrada; pasa a estar viva |

```bash
# borrar lo que queda del árbol viejo (las 3 páginas de arriba quedan como redirect)
git rm app/dashboard/tipo-salida/componentes/createTipoSalidaButton.tsx \
       app/dashboard/tipo-salida/componentes/createTipoSalidaForm.tsx \
       app/dashboard/tipo-salida/componentes/searchTipoSalida.tsx \
       app/dashboard/tipo-salida/componentes/tipoSalidaPage.tsx \
       app/dashboard/tipo-salida/componentes/TipoSalidaTable.tsx

# y el form viejo del árbol canónico, ahora reemplazado por CategoriaGastoForm
git rm app/dashboard/gasto/componentes/createTipoSalidaForm.tsx \
       app/dashboard/gasto/componentes/createTipoSalidaButton.tsx
```

El botón viejo pushea a `/dashboard/tipo-salida/create` (árbol borrado) y el
listado ya trae su propio botón "Nueva categoría", así que se va.

### Caso B — Categorías de producto

| Archivo | Acción |
|---|---|
| `app/dashboard/productos/tipo-producto/page.tsx` | **sobrescribir** — import corregido |
| `…/componentes/tipoProductoPage.tsx` | **sobrescribir** — canónico + ResponsiveTable |
| `…/componentes/searchTipoProducto.tsx` | **sobrescribir** — lucide |
| `…/componentes/TipoProductoForm.tsx` | **nuevo** — form único |
| `…/create/page.tsx` | **sobrescribir** — de 94 a 7 líneas |
| `…/[id]/edit/page.tsx` | **sobrescribir** |
| `app/dashboard/tipo-producto/{page,create/page,[id]/edit/page}.tsx` | **sobrescribir** — redirects |
| `app/dashboard/productos/componentes/createTipoProductoButton.tsx` | **sobrescribir** — lucide |

```bash
git rm app/dashboard/tipo-producto/componentes/searchTipoProducto.tsx \
       app/dashboard/tipo-producto/componentes/tipoProductoPage.tsx
```

---

## Ajuste en modules.ts

Las dos entradas auxiliares quedan mal o de más:

```ts
  'tipo-producto': { … href: '/dashboard/productos/tipo-producto' … },  // ← redundante
  'tipo-salida':   { … href: '/dashboard/gasto/tipo-salida' … },        // ← ruta que no existe
```

`productos` y `gasto` ya tienen `prefix: true`, así que cubren sus subrutas. Las
dos entradas se pueden borrar. Si preferís conservarlas explícitas, al menos
corregí el href de `tipo-salida` a `'/dashboard/gasto'`.

---

## Lo que esto cierra de otras fases

| Tarea | Antes | Después de 3.3 |
|---|---|---|
| 2.2 · `useAuthCheck()` sueltos | 34 | **24** |
| 2.5 / 4.4 · archivos con FontAwesome | 13 | **7** |
| 4.3 · tablas migradas | 1 (muerta) | **2 vivas** |
| 4.1 · pantallas con `ErrorState` | 0 | 2 |

Los 10 `useAuthCheck()` que se van: 4 en `tipo-salida/`, 3 en `tipo-producto/`,
y 3 en los archivos canónicos que ahora delegan al guard del layout.

---

## Verificación

```bash
# 1. nada importa los árboles borrados
grep -rn "dashboard/tipo-salida/componentes\|dashboard/tipo-producto/componentes" app/
#    → sin resultados

# 2. no quedan imports que cruzan de árbol
grep -rn "from .@/app/dashboard/tipo-" app/dashboard/gasto app/dashboard/productos
#    → sin resultados

# 3. contadores
grep -rn "useAuthCheck()" app/dashboard --include='*.tsx' | wc -l   # 34 → 24
grep -rln "@fortawesome" app/ components/ | wc -l                   # 13 → 7

npm run typecheck
```

### Prueba manual

**Categorías de gasto**
- [ ] `/dashboard/gasto` lista las categorías **con la tabla nueva** (tarjetas en teléfono, paleta morada, íconos lucide) — es la señal de que 4.3 por fin está vivo
- [ ] "Nueva categoría" → formulario **con el select de tipo** (antes el de create no lo tenía) y crea de verdad
- [ ] Editar → precarga nombre y tipo, actualiza, vuelve al listado
- [ ] Eliminar → toast, y la fila desaparece porque se recargó la lista, no por filtrar el estado local
- [ ] Sin datos → estado vacío con botón, no una tabla en blanco
- [ ] Apagar la API → `ErrorState` con Reintentar
- [ ] `/dashboard/tipo-salida`, `/dashboard/tipo-salida/create` y `/dashboard/tipo-salida/7/edit` redirigen

**Categorías de producto**
- [ ] `/dashboard/productos/tipo-producto` lista y ordena por nombre
- [ ] Crear y editar **se quedan dentro del mismo árbol** — antes Editar saltaba a `/dashboard/tipo-producto/{id}/edit`
- [ ] Con un usuario que tenga `productos` pero **no** `tipo-producto`: Editar funciona (antes caía en *Sin acceso*)
- [ ] `/dashboard/tipo-producto/*` redirige

**Regresión**
- [ ] El menú sigue mostrando los mismos ítems (nada de esto toca `modules.ts` salvo el ajuste opcional)
- [ ] `/dashboard/gasto` sigue siendo alcanzable con un token que solo tenga el módulo `gasto`
