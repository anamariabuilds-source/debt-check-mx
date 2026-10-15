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
| M19 | Cuota debajo del límite con comisiones/fechas desconocidas | Estilo neutral; aclarar que solo compara cantidades y no demuestra asequibilidad | mensaje neutral compartido por calculadora y explicación; texto ambiguo eliminado | PASA |

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

## Corrección de Persona Test sintético antes de Deployment 2

El hallazgo proporcionado fue falsa seguridad causada por la confirmación verde “Dentro de tu límite elegido”. `p test.docx` no estaba presente y no fue inspeccionado; no se agregaron hallazgos distintos de los reproducidos por el usuario. La corrección M19 neutraliza el mensaje cuando existen datos materiales desconocidos y coloca la advertencia de incertidumbre junto a la comparación en ambas experiencias.

## Dragon Stack — prueba preproducción

La suite añade casos separados para consentimiento ausente, clave faltante, respuesta Gemini válida, error, timeout, cifra inventada, preservación de UNKNOWN, autonomía y etiquetas real/simulada. Visión cubre imagen ficticia válida, firma no compatible, límite de tamaño, comisiones/fechas ausentes, ambigüedad, confirmación selectiva, rechazo, error y respuesta malformada.

Las respuestas de proveedor están simuladas en la suite para que las pruebas normales no consuman cuota. Además, el 2026-10-15 se hizo una comprobación local separada con credenciales reales no impresas y datos exclusivamente ficticios:

- **Explicación:** `gemini-3.5-flash-lite` devolvió `mode: real` y `EXPLICACIÓN GENERADA CON IA`. Conservó comisiones y fechas desconocidas, ingreso irregular, pagos coincidentes y control del comprador. El resultado determinista siguió mostrando subtotal 3,600, diferencia 0, comisiones `UNKNOWN`, fechas `UNKNOWN` y coincidencia conocida de 550. No hubo aprobación de compra ni recálculo del modelo.
- **Visión:** sobre una oferta ficticia que mostraba 3,600 MXN, 6 mensualidades de 600 MXN y que no indicaba comisiones ni fechas, devolvió exactamente `purchasePrice: 3600`, `installmentCount: 6`, `advertisedInstallment: 600`, `knownFees: null`, `feeStatus: UNKNOWN`, `dueDates: []` y `verified: false`.
- **Falla segura observada:** una solicitud concurrente de explicación cayó al fallback rotulado sin exponer la causa interna; una repetición aislada obtuvo respuesta real. La calculadora no perdió resultados.
- **Corrección real:** la primera respuesta válida incluyó una referencia demasiado positiva a estar dentro del límite. Se endurecieron instrucción y validación, se añadió regresión y la siguiente respuesta real aclaró que solo la cuota anunciada cumple el límite elegido y que esto no confirma capacidad de pago.
- **Suite final:** 5 archivos, 43 pruebas; TypeScript, lint y build de producción pasan. `npm audit --omit=dev` reporta 0 vulnerabilidades.

Esta evidencia es local y no implica que la integración ya esté publicada o verificada en Vercel.
