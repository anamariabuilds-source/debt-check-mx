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

No hay base de datos, login, banca ni persistencia. El endpoint `/api/explain` valida tamaño y esquema; actualmente siempre responde en modo simulado. Nunca uses variables `NEXT_PUBLIC_` para secretos.

Consulta `docs/PACKET.md`, `docs/MECHANICAL_TEST.md`, `docs/COMPARISON_TEST.md`, `docs/ECONOMICS.md` y `DECISIONS.md` para alcance y evidencia.

## Deployment 1

Producción verificada: https://debt-check-mx.vercel.app

La URL corresponde al primer despliegue técnico. No demuestra ventaja de IA ni resultados con participantes.
