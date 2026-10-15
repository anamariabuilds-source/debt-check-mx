# Marco de evidencia económica

Estado: estimaciones por completar; sin validación comercial.

## Costo por revisión

- Calculadora y explicación simulada: costo marginal de modelo = 0 MXN; infraestructura Vercel gratuita es una hipótesis de MVP, no costo garantizado a escala.
- Integración preparada: Gemini `gemini-3.5-flash-lite`. La tabla oficial consultada el 2026-10-15 indica free tier sin cargo y, para nivel pagado estándar, USD 0.30 por millón de tokens de entrada y USD 2.50 por millón de tokens de salida, incluidos los tokens de razonamiento. Son precios publicados, no gasto observado.
- Cada explicación limita la salida a 350 tokens y cada extracción a 450. El costo por revisión sigue sin medirse porque no existe un registro de uso real validado.
- El nivel gratuito puede usar entradas y salidas para mejorar productos. El demo acepta solo contenido ficticio con consentimiento; privacidad y costo no se intercambian silenciosamente.
- Protección de costo: código de acceso supervisado obligatorio, timeout corto, payloads limitados y máximo local de 6 solicitudes por tipo cada 10 minutos. El rate limit en memoria no es global entre instancias Vercel; para uso público no supervisado se requeriría un limitador compartido mínimo (por ejemplo, Upstash/Vercel KV) y presupuesto/alertas del proveedor.
- Separar costos fijos (desarrollo, soporte, seguridad) de costos variables por revisión.

## Preguntas de disposición a pagar

- ¿Qué problema verificable resolvería para su organización esta revisión previa?
- ¿Quién obtiene el beneficio y quién pagaría sin influir en la recomendación?
- ¿Qué monto pagaría por una prueba limitada y qué resultado exigiría?
- ¿Aceptaría independencia total de comercios y prestamistas, sin anuncios ni referidos?
- ¿Firmaría o pagaría un piloto? Una opinión positiva no cuenta como compromiso.

## Posible valor para la persona usuaria

La persona puede anotar una comisión o cargo que habría evitado después de conocerlo. Debe registrarse como ahorro hipotético definido por ella hasta verificar el resultado real. La razón beneficio:costo de 10:1 es una hipótesis sin validar.
