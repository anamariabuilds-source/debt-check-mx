# Prueba mecánica — 2026-10-15

Entorno local: Node 24.19.0, Next.js 16.4.1, Vitest 5.0.5. Datos exclusivamente ficticios.

| ID | Escenario | Resultado esperado | Resultado real | Estado |
|---|---|---|---|---|
| M01 | Comisiones desconocidas | Subtotal conocido; total final desconocido | 3,600 conocido; total `undefined`/DESCONOCIDO | PASA |
| M02 | Fechas de cuotas ausentes | No inferir calendario | `dateStatus: UNKNOWN` | PASA |
| M03 | Dos obligaciones el mismo día | Detectar coincidencia y sumar importes conocidos | Coincidencia detectada; 550 MXN | PASA |
| M04 | Ingreso irregular | Capacidad mensual desconocida | `budgetStatus: unknown` | PASA |
| M05 | Presupuesto cero | No mostrar “dentro” | `exceeds` | PASA |
| M06 | Presupuesto negativo | No mostrar “dentro” | `exceeds` | PASA |
| M07 | Límite 500, cuota 600 | Supera límite; no bloquear | `limitStatus: exceeds` | PASA |
| M08 | Límite cambiado a 700 | Recalcular como dentro | `within` | PASA |
| M09 | Límite eliminado | Sin comparación oculta | `not_set` | PASA |
| M10 | 6 × 650 frente a precio 3,600 | Diferencia 300, no llamarla interés | 300 y mensaje “diferencia sin explicar” | PASA |
| M11 | Mensualidad ausente | No calcular subtotal ni capacidad | valores desconocidos | PASA |
| M12 | Entrada extremadamente grande | Rechazar sin overflow | `RangeError` | PASA |
| M13 | Texto, negativo, más de dos decimales | Rechazar entrada monetaria | conversión devuelve `undefined` | PASA |
| M14 | Explicación agrega 4,200 | Rechazar número sin respaldo | validación `false` | PASA |
| M15 | Servicio LLM no disponible | Calculadora funciona; fallback rotulado | `SIMULATED AI OUTPUT` | PASA |
| M16 | Comisión confirmada cero vs. desconocida | 3,600 solo en caso confirmado | 3,600 vs. desconocido | PASA |
| M17 | Obligaciones incompletas | Mostrar incertidumbre | falta “Confirmación…” | PASA |
| M18 | Cuota nueva y renta misma fecha | Detectar coincidencia y total 1,100 | detectado tras corrección | PASA |

## Bug real, corrección y regresión

- **Falla observada:** el motor original agregaba al mapa de coincidencias únicamente obligaciones existentes. Una fecha conocida de la nueva cuota podía coincidir con la renta y no generar advertencia.
- **Causa:** `dueDates` se usaba para mostrar conocimiento, pero no alimentaba el detector determinista.
- **Corrección:** cada fecha capturada de la compra entra al mismo mapa con el importe anunciado, sin inventar fechas faltantes.
- **Regresión:** M18 verifica IDs, fecha y suma exacta de 1,100 MXN. La suite completa pasó: 3 archivos, 19 pruebas.
- **Verificación técnica:** `npm test`, `npm run typecheck`, `npm run lint` y `npm run build` pasan localmente.
- **Deployment 1:** verificado el 2026-10-15 en `https://debt-check-mx.vercel.app`, deployment `dpl_DEdZSdqSXQKxQF5NYfJLaef4LNNr`, commit `677603f`. La portada pública y `/api/explain` respondieron correctamente. Deployment 2 continúa pendiente de una mejora genuina.

## Hallazgos adicionales

- La primera build falló porque `next/font` intentó descargar Google Fonts sin red. Se sustituyó por una pila de tipografías del sistema; la build posterior pasó.
- La auditoría de producción (`npm audit --omit=dev`) reporta 0 vulnerabilidades. El árbol de desarrollo conserva 5 avisos altos transitivos en `eslint-config-next`/`fast-glob`; la corrección sugerida por npm degrada Next ESLint a 14.2.35 y no se aplicó.
