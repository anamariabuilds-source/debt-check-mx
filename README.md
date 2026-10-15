# Debt Check MX — Reality Test

Proyecto Week 10 · Business Bending · Ana María Matas · rol ADVERSARY.

Este repositorio parte de un paquete de diseño previo al código. El producto comparará una calculadora determinista con una explicación clara basada exactamente en los mismos datos ficticios. No compra, presta, aprueba, rechaza ni bloquea decisiones.

## Funciones

- Captura manual y efímera de un ejemplo ficticio.
- Motor TypeScript en centavos, independiente de cualquier LLM.
- Propagación explícita de datos desconocidos e inconsistentes.
- Presupuesto, ingreso irregular, límite opcional reversible y pagos coincidentes.
- Comparación entre calculadora y explicación determinista, rotulada `SIMULATED AI OUTPUT`.
- Autoevaluación de comprensión que no almacena respuestas.
- Explicación opcional con Gemini y lectura opcional de una oferta ficticia, ambas con consentimiento y código de acceso del demo.

## Desarrollo

Requiere Node.js 20.9 o posterior.

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Verificación

```bash
npm test
npm run typecheck
npm run lint
npm run build
npm audit --omit=dev
```

## Privacidad y configuración

No hay base de datos, login, banca ni persistencia. La calculadora permanece en el navegador. La IA externa es opcional, solo para datos e imágenes ficticias, y requiere consentimiento explícito.

Configura localmente, sin compartir valores en chats ni Git:

```bash
cp .env.example .env.local
```

Define en `.env.local`:

- `GEMINI_API_KEY`: clave server-side de Google AI Studio.
- `AI_DEMO_ACCESS_TOKEN`: código diferente que se entrega únicamente durante la demostración supervisada.

En Vercel deben configurarse como variables de entorno de producción. Ninguna usa el prefijo `NEXT_PUBLIC_`.

Sin consentimiento, clave o código válido, `/api/explain` conserva `SIMULATED AI OUTPUT`; `/api/vision` no llama al proveedor y la captura manual continúa disponible.

## Dragon Stack

1. **LLM real:** Gemini `gemini-3.5-flash-lite` explica hechos calculados sin cambiar cifras.
2. **Datos de restricciones del usuario:** oferta, presupuesto, regularidad del ingreso, obligaciones, fechas y límite opcional.
3. **Visión real:** el mismo modelo lee una captura ficticia y devuelve una propuesta no verificada que la persona corrige y confirma campo por campo.

El motor determinista continúa como única fuente de verdad financiera.

Consulta `docs/PACKET.md`, `docs/MECHANICAL_TEST.md`, `docs/COMPARISON_TEST.md`, `docs/ECONOMICS.md` y `DECISIONS.md` para alcance y evidencia.

## Deployment 1

Producción verificada: https://debt-check-mx.vercel.app

La URL corresponde al primer despliegue técnico. No demuestra ventaja de IA ni resultados con participantes.
