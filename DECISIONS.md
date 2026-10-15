# Decisiones — Debt Check MX: Reality Test

## Registro

### 2026-10-15 — Paquete antes de código

- **Contexto:** inicio del prototipo Week 10, rol ADVERSARY.
- **Decisión:** conservar Option A: captura manual, calculadora determinista y comparación honesta con explicación tipo IA. No se añadirá OCR, banca, precios ni automatización sin aprobación.
- **Condiciones:** 1, 2, 3, 4, 5 y 6.
- **Evidencia revisada:** `docs/PACKET.md`, `docs/mockup.png`, `PACKET_AnaMariaMatas.pdf` y presencia de `BRIEF_AnaMariaMatas-2.pdf`.
- **Riesgo abierto:** `BLUEPRINT_team_WEEK10.pdf` no está en el repositorio. Se usarán solamente las seis condiciones y la declaración exacta incluidas en el paquete y el prompt.
- **Inconsistencia:** `docs/PACKET.md` dice “Team Blueprint (uploaded)”, pero el archivo fuente no está disponible localmente. No se afirmará que fue verificado.
- **Límite de verificación:** el host no incluye un extractor de texto PDF; el brief está disponible pero no pudo extraerse de forma fiable. El paquete Markdown sí fue leído por completo y contiene su síntesis y referencias.
- **Dragon Stack:** una línea de tiempo determinista aporta valor técnico, pero no está confirmado que cuente como el tercer componente académico. No se afirmará cumplimiento hasta recibir confirmación del profesor.
- **Privacidad:** estado efímero, ejemplos ficticios, sin cuentas, banco, base de datos ni analítica financiera.
- **IA:** el MVP funcionará con salida determinista claramente rotulada `SIMULATED AI OUTPUT`; una integración real será opcional, server-side, consentida y nunca alterará cálculos.
- **Propietaria:** Ana María Matas.
- **Siguiente acción:** crear y probar primero el motor financiero independiente.

## Cierre de sesión

Se actualizará al terminar cada ciclo con: qué cambió, qué funciona, qué falló o sigue sin probarse y la siguiente tarea concreta.

### 2026-10-15 — Implementación y prueba mecánica

- **Qué cambió:** motor financiero en centavos, validación Zod server-side, formulario responsive, calculadora, explicación simulada, comprensión y documentación económica/comparativa.
- **Qué funciona:** 19 pruebas; TypeScript, lint y build de producción pasan. La calculadora funciona sin IA y el modo explicativo está visible como `SIMULATED AI OUTPUT`.
- **Bug real:** no se comparaban fechas conocidas de la nueva compra contra obligaciones existentes. Se agregó al detector y M18 demuestra la regresión.
- **Seguridad:** sin secretos ni persistencia; límite de request de 16 KiB; `npm audit --omit=dev` = 0 vulnerabilidades. Quedan avisos transitivos de desarrollo en el stack ESLint que npm solo propone resolver degradando una dependencia mayor.
- **Decisión de tipografía:** se eliminó `next/font` después de que la build offline no pudo llegar a Google Fonts. Se usa una pila local del sistema.
- **Lo no probado:** navegación visual en navegador real, lector de pantalla, Playwright, participantes reales, persona sintética en conversación nueva y proveedor LLM real.
- **Despliegue:** bloqueado por ausencia de autenticación/CLI de Vercel y remoto GitHub. No se afirma Deploy 1 ni Deploy 2.
- **Blueprint / Dragon Stack:** el archivo continúa ausente y la ambigüedad continúa sin resolver.
- **Primer paso siguiente:** conectar el repositorio a GitHub/Vercel, ejecutar Deploy 1, verificar URL; luego hacer la prueba persona en conversación nueva y desplegar su corrección real como Deploy 2.
