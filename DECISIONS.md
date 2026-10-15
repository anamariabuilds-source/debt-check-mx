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

### 2026-10-15 — Integración incremental Dragon Stack

- **Alcance:** se preservaron las pantallas y el motor. Se reutilizó `/api/explain`, se añadió `/api/vision` y dos controles opcionales dentro de las pantallas existentes.
- **Componente 1:** inferencia server-side real con Google Gemini `gemini-3.5-flash-lite`; salida JSON limitada, timeout de 8 segundos, máximo de 350 tokens y validación de cifras/afirmaciones. El fallback sigue rotulado `SIMULATED AI OUTPUT`.
- **Componente 2:** los datos de restricciones existentes no cambiaron y continúan siendo efímeros.
- **Componente 3:** visión Gemini sobre PNG/JPEG/WebP ficticios de máximo 2 MB. Se valida firma real del archivo, no solo MIME. La respuesta es propuesta `verified: false`; nada se transfiere sin selección y confirmación explícitas.
- **Privacidad:** consentimiento desmarcado por defecto y divulgación de procesamiento externo. El nivel gratuito de Gemini puede usar contenido enviado y respuestas para mejorar productos y permitir revisión humana; por ello se prohíben datos reales, sensibles o personales en este demo.
- **Abuso/costo:** la inferencia real requiere `AI_DEMO_ACCESS_TOKEN`, distinto de la API key, más límite en memoria de 6 solicitudes por tipo cada 10 minutos e IP/instancia. El límite en memoria no es global en Vercel y no basta por sí solo; el código supervisado es el control primario. No se expone un proxy abierto.
- **Modelo/costo:** Google documenta `gemini-3.5-flash-lite` como estable, multimodal y apto para resultados estructurados. A 2026-10-15, la tabla oficial muestra entrada y salida sin cargo en free tier; en pago estándar muestra USD 0.30 por millón de tokens de entrada y USD 2.50 por millón de tokens de salida (incluye tokens de razonamiento). No se midió consumo ni se afirma costo real.
- **Compatibilidad real:** la primera verificación con `gemini-2.5-flash-lite` recibió 404 porque Google limita esa familia a proyectos con uso previo. Se adoptó el reemplazo estable que indicó la propia API, `gemini-3.5-flash-lite`, sin cambiar la arquitectura.
- **Verificación real local:** con credenciales locales no impresas, Gemini produjo una explicación real para el caso ficticio de 3,600 MXN en 6 mensualidades de 600 MXN. La respuesta conservó comisiones y fechas desconocidas, ingreso irregular, obligaciones incompletas y la coincidencia de dos pagos; no modificó el resultado determinista ni aprobó la compra. Un intento concurrente activó correctamente el fallback sin exponer la causa interna; la repetición aislada fue real y válida.
- **Verificación visual real:** Gemini leyó la imagen ficticia preparada y propuso exactamente precio 3,600, 6 mensualidades y cuota 600; devolvió `knownFees: null`, `feeStatus: UNKNOWN`, `dueDates: []` y `verified: false`. La imagen no contenía datos personales.
- **Regresión de falsa tranquilidad:** una primera explicación real usó una formulación ambigua sobre estar dentro del límite. Se reforzó el prompt y el validador para exigir que solo la mensualidad anunciada se compare con el límite autoelegido y que esto no confirme capacidad de pago. La respuesta real posterior cumplió esa distinción.
- **Verificación técnica local:** 43 pruebas pasan; TypeScript, lint y build pasan; `npm audit --omit=dev` reporta 0 vulnerabilidades.
- **Publicación autorizada:** commit `9158690` publicado en `origin/main` mediante push normal, sin reescritura de historial.
- **Deployment Dragon Stack:** Vercel confirmó `READY` para `dpl_BK4Zs8XctN4NuF6XJXWkHoXJQEYP`, con alias `https://debt-check-mx.vercel.app`.
- **Verificación pública:** la portada respondió correctamente y conservó captura manual y las cuatro etapas visibles. Sin consentimiento, `/api/explain` mantuvo `SIMULATED AI OUTPUT`, `externalProcessing: false` y los resultados deterministas. Sin código, `/api/vision` respondió HTTP 403.
- **Gemini real en producción:** una explicación consentida devolvió `EXPLICACIÓN GENERADA CON IA`, conservó subtotal 3,600, diferencia 0, comisiones y fechas `UNKNOWN`, coincidencia de 550 e ingreso irregular; distinguió la cuota anunciada del límite autoelegido y no aprobó la compra. Una solicitud anterior activó el fallback seguro y la repetición fue válida.
- **Visión real en producción:** la oferta completamente ficticia produjo exactamente precio 3,600, 6 mensualidades y cuota 600, con `knownFees: null`, `feeStatus: UNKNOWN`, `dueDates: []` y `verified: false`.
- **Estado honesto:** los tres componentes funcionan localmente y en el deployment verificado con datos ficticios. No se afirma ventaja de comprensión, precisión general de visión ni validación con usuarios reales.

### 2026-10-15 — Correcciones posteriores al segundo Persona Test sintético (prepublicación)

- **Fuente y alcance:** los hallazgos provienen de un segundo recorrido con persona sintética. `p test 2.docx` no está disponible en el repositorio y no se afirma haberlo inspeccionado; se usó únicamente el resumen proporcionado. La versión evaluada fue la anterior a estas correcciones.
- **Presupuesto:** se confirmó en código que las obligaciones no se restan del presupuesto; solo participan en detección de fechas. No existía doble conteo aritmético. Se aclaró que el presupuesto ya debe reflejar gastos y compromisos descontados, que no debe restarse dos veces la misma obligación y que, con ingreso variable, es una estimación no garantizada.
- **Compromisos conocidos:** se añadió una síntesis determinista y compacta de obligaciones registradas en la misma fecha. Para el escenario proporcionado muestra 550 MXN el 15 de noviembre de 2026 y aclara que, sin fechas de las nuevas mensualidades, no puede confirmarse un cruce con la compra.
- **Privacidad y acceso:** se sustituyó el mensaje absoluto de datos locales por la distinción entre calculadora local y Gemini opcional con consentimiento. Ambos campos de código explican que lo proporciona quien supervisa el demo y que no es contraseña ni clave de Gemini.
- **Datos precargados:** se añadió una advertencia visible de que los valores iniciales son un ejemplo ficticio que debe revisarse o limpiarse.
- **Cierre y comprensión:** el botón y el resultado ahora expresan finalización sin calificación. Se añadió una lista neutral de comisiones, fechas, compromisos ya contabilizados y realismo del presupuesto en meses de menor ingreso que conviene confirmar antes de decidir.
- **Sin cambios intencionales:** no se modificó aritmética, esquema de datos, cuatro etapas, Gemini, consentimiento, control de acceso, fallback, límites opcionales ni evidencia histórica. No se afirmó que la IA mejorara comprensión; el resultado adversario sigue admitiendo que la calculadora fue suficiente.
- **Pendiente de evidencia:** estas correcciones aún no han sido probadas con personas reales ni con una nueva persona sintética, y todavía no están publicadas. La validación local técnica y visual se registrará al cerrar este ciclo.
- **Validación local:** 48 pruebas en 6 archivos, TypeScript, lint y build de producción pasan; `npm audit --omit=dev` reporta 0 vulnerabilidades. Se recorrieron localmente las cuatro etapas sin código de demo y se inspeccionaron captura, calculadora, explicación simulada y cierre en desktop y móvil. También se revisó el escenario ficticio de ingreso irregular y obligaciones de 300 y 250 MXN en la misma fecha; el mensaje mostró 550 MXN, mantuvo desconocido el cruce con la nueva compra y no reintrodujo confirmaciones verdes.
- **Límite de validación:** la inspección fue técnica, no una prueba humana. No se ejecutó Gemini porque estas correcciones no alteran sus endpoints, consentimiento, acceso o etiquetado; esas rutas conservan sus pruebas automatizadas existentes. No se hizo commit, push ni deployment.

### 2026-10-15 — Publicación verificada de correcciones posteriores al segundo Persona Test

- **Commit funcional:** `ffa5b94` (`fix: clarify post-persona financial guidance`), publicado mediante push normal a `origin/main`; no se reescribió historial.
- **Deployment funcional:** Vercel `dpl_Dx7cD2js2ypXj2cntM91QNHPfN6S`, estado `READY`, URL y alias verificado `https://debt-check-mx.vercel.app`.
- **UX pública verificada:** están visibles la guía para no descontar dos veces obligaciones, la incertidumbre del presupuesto con ingreso variable, las dos obligaciones por 550 MXN el 15 de noviembre de 2026, la imposibilidad de confirmar cruce con cuotas sin fechas, el aviso de ejemplo ficticio, privacidad local/externa precisa, orientación del código de demo, cierre con próximos datos por confirmar y autoevaluación sin calificación.
- **Calculadora y control:** funcionó sin IA ni código; mantuvo comisiones y fechas `UNKNOWN`, subtotal anunciado de 3,600 MXN y ausencia de mensaje verde. Sin consentimiento, `/api/explain` devolvió `SIMULATED AI OUTPUT` y `externalProcessing: false`; sin código, `/api/vision` respondió HTTP 403.
- **Gemini real:** con consentimiento, código y datos completamente ficticios, explicación devolvió `EXPLICACIÓN GENERADA CON IA` sin cambiar la aritmética ni aprobar la compra. Visión extrajo 3,600 MXN, 6 cuotas y 600 MXN; mantuvo comisiones `UNKNOWN`, fechas vacías y `verified: false`.
- **Seguridad:** los valores reales de `GEMINI_API_KEY` y `AI_DEMO_ACCESS_TOKEN` no aparecen en ningún commit del historial ni en HTML, JavaScript o CSS públicos. Los valores nunca se imprimieron.
- **Honestidad:** esta es verificación técnica de producción, no una tercera prueba de persona ni evidencia de mejora de comprensión. La prueba sintética evaluó la versión anterior.
