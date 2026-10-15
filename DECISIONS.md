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

### 2026-10-15 — Recorrido manual local completado

- **Tipo de evidencia:** revisión manual preliminar de la propietaria del proyecto. No es prueba de persona sintética ni investigación con usuarios reales.
- **Cobertura confirmada:** se abrieron correctamente las cuatro pantallas: captura de datos, calculadora básica, explicación simulada y evaluación de comprensión.
- **Comportamiento confirmado:** las comisiones desconocidas y el total final desconocido permanecieron explícitamente desconocidos.
- **Observación preliminar 1:** las preguntas de comprensión aparecen únicamente después de ver tanto la calculadora como la explicación. Por ello, el flujo actual no establece de manera independiente si la explicación mejora la comprensión frente a la calculadora.
- **Observación preliminar 2:** los mensajes verdes que indican que la mensualidad está dentro del límite elegido podrían crear falsa confianza cuando las comisiones y el costo final siguen siendo desconocidos.
- **Decisión inmediata:** documentar ambos riesgos sin rediseñar todavía la aplicación. La siguiente mejora deberá elegirse y justificarse después del primer despliegue verificado.

### 2026-10-15 — Deployment 1 verificado

- **Repositorio:** `https://github.com/anamariabuilds-source/debt-check-mx.git`; `main` fue publicado sin force-push y conservó sus ocho commits existentes.
- **Commit desplegado:** `677603f6216ef2a95471b4fbf666177bf113df8a`.
- **Vercel:** proyecto `anamaria-builds/debt-check-mx`; deployment `dpl_DEdZSdqSXQKxQF5NYfJLaef4LNNr`; estado reportado `READY`.
- **URL de producción:** `https://debt-check-mx.vercel.app`.
- **Verificación pública:** la portada respondió HTTP 200 y mostró el título `Debt Check MX — Reality Test`, `DEMO · DATOS FICTICIOS` y `Antes de comprar`. El endpoint `/api/explain` respondió `SIMULATED AI OUTPUT` y preservó `feeKnowledge: UNKNOWN`.
- **Honestidad:** este despliegue verifica disponibilidad técnica, no comprensión, ventaja de IA ni evidencia de usuarios.
- **Siguiente acción:** elegir una mejora genuina a partir de la revisión manual documentada, probarla, hacer un único push y verificar Deployment 2.

### 2026-10-15 — Corrección posterior a Persona Test sintético

- **Fuente disponible:** el usuario informó que la prueba sintética completa y el registro original están en `p test.docx`, pero ese archivo no está presente en el repositorio. No se afirma haberlo inspeccionado; esta decisión usa únicamente los hallazgos reproducidos por el usuario.
- **Mayor problema observado:** falsa seguridad creada por mensajes verdes y la confirmación “Dentro de tu límite elegido”. Mariana la interpretó repetidamente como posible aprobación de la compra aunque las comisiones, la capacidad futura y algunas fechas seguían desconocidas.
- **Reacciones exactas proporcionadas:** “Good, so maybe I can buy it.”; “Wait, so does that mean I can afford it or not?”; “I'm answering that the payment is below my limit, not that I can safely pay it.”
- **Corrección enfocada:** cuando falta información financiera importante, la comparación usa estilo neutral e ícono informativo. El texto dice que la **cuota anunciada** está debajo del **límite autoelegido** y coloca junto al resultado que eso solo compara dos cantidades y no demuestra que la compra sea asequible.
- **Consistencia:** la misma regla y el mismo generador de mensajes se usan en la calculadora y en la explicación simulada. La comparación de presupuesto también deja de mostrarse como confirmación verde si persiste incertidumbre material.
- **Control del comprador:** ningún mensaje aprueba, prohíbe o bloquea la compra; el límite continúa editable y removible.
- **Cálculos:** no se cambió el motor financiero ni se alteró ningún resultado verificado.
- **Regresión:** pruebas específicas verifican tono neutral, mención de datos faltantes, ausencia del mensaje ambiguo y preservación del control cuando el límite se supera.
