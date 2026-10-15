# Protocolo de comparación — calculadora vs. explicación

Estado: preparado, no ejecutado con participantes reales.

## Hipótesis adversaria

La explicación simulada solo aporta valor si mejora comprensión con respecto a la calculadora usando exactamente los mismos hechos. Empate significa “sin ventaja de IA demostrada”.

## Diseño

1. Usar únicamente el escenario ficticio visible.
2. Alternar A→B y B→A entre participantes reales para reducir efecto de orden. La interfaz MVP guía A→B; cualquier resultado con ese orden fijo debe declararse sesgado por aprendizaje.
3. Preguntar tras cada experiencia: total conocido, información faltante, relación cuota/límite y conocimiento de fechas.
4. Preguntar aparte si usaría la herramienta antes de pagar y por qué.
5. Registrar con consentimiento: tiempo, respuestas factuales, preferencia y comentarios. No guardar montos personales.

## Métricas futuras

- Aciertos de comprensión por experiencia.
- Tiempo de finalización por experiencia.
- Errores sobre comisiones y fechas desconocidas.
- Preferencia declarada, separada de intención de uso.
- Tasa de abandono y punto de abandono.

No existen participantes, resultados, ventaja de IA ni evidencia causal todavía.

## Regresión enfocada posterior a Gemini

No reemplaza ni reinterpreta el Persona Test original. Ejecutar después de configurar la integración real:

1. Confirmar que sin consentimiento aparece `SIMULATED AI OUTPUT` y no hay request externo.
2. Con ejemplo ficticio, verificar que `EXPLICACIÓN GENERADA CON IA` solo aparezca tras respuesta real válida.
3. Confirmar que comisiones y fechas ausentes permanezcan DESCONOCIDAS en calculadora, explicación y visión.
4. Revisar que no reaparezcan confirmaciones verdes ni lenguaje de aprobación/asequibilidad.
5. Subir una oferta ficticia con términos conocidos; comparar cada propuesta con texto visible y corregir/rechazar antes de aplicar.
6. Simular error o clave ausente y confirmar que captura manual, calculadora y fallback sigan disponibles.

Registrar solo observaciones nuevas. La prueba original evaluó la versión simulada, no el modelo Gemini.

### Evidencia local del 2026-10-15

Los puntos 2 a 5 se comprobaron técnicamente con un escenario y una imagen ficticios: la etiqueta real apareció solo tras una respuesta válida; las comisiones y fechas siguieron desconocidas; el texto no aprobó la compra y distinguió la cuota anunciada del límite autoelegido; la extracción visual coincidió con los tres términos visibles y quedó sin verificar hasta confirmación. El fallback también se observó ante una solicitud que no completó la validación. Esto es regresión técnica, no una nueva prueba de persona ni evidencia de mayor comprensión.

## Persona sintética preparada

**SINTÉTICA · NO ENTREVISTADA:** Mariana, 27 años, Ciudad de México, ingreso variable por turnos, evalúa una compra ficticia de 3,600 MXN en seis cuotas anunciadas de 600 MXN y no sabe si existen comisiones.

En una conversación nueva deberán mostrarse capturas reales en secuencia y registrar confusión, dudas, interpretaciones erróneas, abandono, confianza excesiva en IA, desconocimiento de fechas/comisiones y preocupaciones de control. Este archivo no contiene hallazgos inventados.
