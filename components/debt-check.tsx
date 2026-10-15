"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Brain, Calculator, Check, ChevronLeft, Info, LoaderCircle, LockKeyhole, Pencil, RotateCcw, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { calculateFinancing } from "@/lib/finance/calculate";
import { formatMxn, parseMxnToCents } from "@/lib/finance/money";
import { getLimitMessage, hasMaterialUnknowns } from "@/lib/presentation/limit-message";
import { BUDGET_GUIDANCE, DEMO_ACCESS_GUIDANCE, getObligationContext, NEXT_INFORMATION_TO_CONFIRM, PRIVACY_GUIDANCE } from "@/lib/presentation/ux-guidance";
import { VisionOffer, type VisionProposal } from "@/components/vision-offer";
import type { ExplanationResponse } from "@/lib/ai/explain";
import type { FeeStatus, FinancingInput, IncomePattern, KnownObligation } from "@/types/finance";

type Step = "datos" | "calculadora" | "explicacion" | "prueba";
type FormState = {
  price: string; count: string; installment: string; feeStatus: FeeStatus; fees: string;
  budget: string; incomePattern: IncomePattern; limit: string; paymentDates: string; obligationsComplete: boolean;
  obligations: Array<{ id: string; label: string; amount: string; date: string }>;
};

const demo: FormState = {
  price: "3600", count: "6", installment: "600", feeStatus: "unknown", fees: "",
  budget: "800", incomePattern: "regular", limit: "650", paymentDates: "", obligationsComplete: false,
  obligations: [],
};

const empty: FormState = {
  price: "", count: "", installment: "", feeStatus: "unknown", fees: "", budget: "",
  incomePattern: "regular", limit: "", paymentDates: "", obligationsComplete: false, obligations: [],
};

const steps: Array<{ id: Step; label: string }> = [
  { id: "datos", label: "Datos" }, { id: "calculadora", label: "Calculadora" },
  { id: "explicacion", label: "Explicación" }, { id: "prueba", label: "Comprensión" },
];

function toInput(form: FormState): FinancingInput | undefined {
  const price = parseMxnToCents(form.price);
  const budget = /^-/.test(form.budget.trim()) ? Math.round(Number(form.budget) * 100) : parseMxnToCents(form.budget);
  const count = Number(form.count);
  if (price === undefined || budget === undefined || !Number.isInteger(count) || count < 1 || count > 120) return;
  const installment = form.installment ? parseMxnToCents(form.installment) : undefined;
  const fees = form.fees ? parseMxnToCents(form.fees) : undefined;
  const limit = form.limit ? parseMxnToCents(form.limit) : undefined;
  if ((form.installment && installment === undefined) || (form.fees && fees === undefined) || (form.limit && limit === undefined)) return;
  const dueDates = form.paymentDates.split(",").map((date) => date.trim()).filter(Boolean);
  if (dueDates.some((date) => !/^\d{4}-\d{2}-\d{2}$/.test(date))) return;
  const obligations: KnownObligation[] = [];
  for (const item of form.obligations) {
    const amount = parseMxnToCents(item.amount);
    if (!item.label.trim() || amount === undefined) return;
    obligations.push({ id: item.id, label: item.label.trim(), amountCents: amount, dueDate: item.date || undefined });
  }
  return {
    purchasePriceCents: price, installmentCount: count, advertisedInstallmentCents: installment,
    feeStatus: form.feeStatus, knownFeesCents: fees, availableBudgetCents: budget,
    incomePattern: form.incomePattern, optionalLimitCents: limit, obligations,
    obligationsComplete: form.obligationsComplete, dueDates: dueDates.length ? dueDates : undefined,
  };
}

export function DebtCheck() {
  const [form, setForm] = useState<FormState>(demo);
  const [step, setStep] = useState<Step>("datos");
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const input = useMemo(() => toInput(form), [form]);
  const result = useMemo(() => {
    if (!input) return;
    try { return calculateFinancing(input); } catch { return; }
  }, [input]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((old) => ({ ...old, [key]: value }));
  const applyVisionProposal = (proposal: VisionProposal) => setForm((old) => ({ ...old, ...proposal }));
  const go = (next: Step) => { setError(""); setStep(next); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const calculate = () => {
    if (!result) { setError("Revisa los campos marcados. Usa montos entre $0 y $1,000,000 MXN."); return; }
    go("calculadora");
  };

  return (
    <main>
      <header className="topbar">
        <a href="#contenido" className="skip">Saltar al contenido</a>
        <div className="brand"><span className="logo">DC</span><span>Debt Check <b>MX</b></span></div>
        <div className="demo-pill">DEMO · DATOS FICTICIOS</div>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">REALITY TEST · COMPARACIÓN HONESTA</p>
          <h1>Antes de comprar,<br/><span>compara.</span></h1>
          <p className="lede">Revisa lo que sí sabes, detecta lo que falta y compara si una explicación aporta más que una calculadora básica.</p>
        </div>
        <div className="trust-grid" aria-label="Principios del producto">
          <Trust icon={<UserRound />} title="Tú decides" text="Sin bloqueos ni compras automáticas." />
          <Trust icon={<LockKeyhole />} title="Privacidad con claridad" text="La calculadora es local; la IA opcional requiere consentimiento." />
          <Trust icon={<ShieldCheck />} title="Información honesta" text="Lo desconocido no se vuelve cero." />
        </div>
      </section>

      <nav className="steps" aria-label="Pasos">
        {steps.map((item, index) => <button key={item.id} className={step === item.id ? "active" : ""} onClick={() => item.id === "datos" || result ? go(item.id) : undefined} disabled={item.id !== "datos" && !result}><span>{index + 1}</span>{item.label}</button>)}
      </nav>

      <div id="contenido" className="workspace">
        {step === "datos" && <section className="panel form-panel">
          <div className="panel-heading"><div><p className="step-kicker">PASO 1</p><h2>Ingresa los datos del anuncio</h2><p>Usa información ficticia. Los campos opcionales pueden quedarse vacíos.</p></div><button className="text-button" onClick={() => setForm(demo)}><RotateCcw size={16}/> Cargar ejemplo</button></div>
          <div className="example-note"><Info size={18}/><p><b>Ejemplo ficticio precargado.</b> Estos valores son solo para demostrar la herramienta; revísalos o usa “Limpiar todo” antes de continuar.</p></div>
          <div className="form-grid">
            <MoneyField label="Precio de compra" value={form.price} onChange={(v) => update("price", v)} required hint="Precio mostrado por la tienda." />
            <Field label="Número de mensualidades" value={form.count} onChange={(v) => update("count", v)} type="number" min="1" max="120" required />
            <MoneyField label="Mensualidad anunciada" value={form.installment} onChange={(v) => update("installment", v)} hint="Déjalo vacío si no aparece." />
            <label className="field"><span>Estado de comisiones <Info size={14}/></span><select value={form.feeStatus} onChange={(e) => update("feeStatus", e.target.value as FeeStatus)}><option value="unknown">No las conozco</option><option value="confirmed_zero">Confirmadas en $0</option><option value="known">Conozco el monto</option></select></label>
            {form.feeStatus === "known" && <MoneyField label="Comisiones conocidas" value={form.fees} onChange={(v) => update("fees", v)} required />}
            <MoneyField label="Presupuesto disponible al mes" value={form.budget} onChange={(v) => update("budget", v)} required hint={BUDGET_GUIDANCE} allowNegative />
            <label className="field"><span>¿Tu ingreso es regular?</span><select value={form.incomePattern} onChange={(e) => update("incomePattern", e.target.value as IncomePattern)}><option value="regular">Sí, suele ser estable</option><option value="irregular">No, cambia cada mes</option></select></label>
            <MoneyField label="Mi límite opcional por cuota" value={form.limit} onChange={(v) => update("limit", v)} hint="Puedes cambiarlo o eliminarlo cuando quieras." />
            <Field label="Fechas conocidas de las cuotas (AAAA-MM-DD, separadas por coma)" value={form.paymentDates} onChange={(v) => update("paymentDates", v)} placeholder="2026-11-01, 2026-12-01" />
          </div>

          <VisionOffer onApply={applyVisionProposal}/>

          <div className="obligations">
            <div><h3>Obligaciones que ya conoces <span>OPCIONAL</span></h3><p>Agrega solo datos ficticios. Las fechas no se infieren.</p></div>
            {form.obligations.map((item, i) => <div className="obligation-row" key={item.id}>
              <input aria-label={`Nombre de obligación ${i + 1}`} placeholder="Ej. renta" value={item.label} onChange={(e) => update("obligations", form.obligations.map((x) => x.id === item.id ? { ...x, label: e.target.value } : x))}/>
              <div className="money-input"><span>$</span><input aria-label={`Monto de obligación ${i + 1}`} placeholder="0" inputMode="decimal" value={item.amount} onChange={(e) => update("obligations", form.obligations.map((x) => x.id === item.id ? { ...x, amount: e.target.value } : x))}/></div>
              <input aria-label={`Fecha de obligación ${i + 1}`} type="date" value={item.date} onChange={(e) => update("obligations", form.obligations.map((x) => x.id === item.id ? { ...x, date: e.target.value } : x))}/>
              <button className="remove" onClick={() => update("obligations", form.obligations.filter((x) => x.id !== item.id))} aria-label={`Eliminar obligación ${i + 1}`}>×</button>
            </div>)}
            <button className="secondary" onClick={() => update("obligations", [...form.obligations, { id: crypto.randomUUID(), label: "", amount: "", date: "" }])}>+ Agregar obligación</button>
            <label className="check"><input type="checkbox" checked={form.obligationsComplete} onChange={(e) => update("obligationsComplete", e.target.checked)}/><span>Confirmo que la lista incluye todas las obligaciones que conozco.</span></label>
          </div>
          {error && <p className="error" role="alert"><AlertTriangle size={18}/>{error}</p>}
          <div className="actions"><button className="ghost" onClick={() => setForm(empty)}>Limpiar todo</button><button className="primary" onClick={calculate}>Comparar ahora <ArrowRight size={18}/></button></div>
          <p className="privacy"><LockKeyhole size={15}/> {PRIVACY_GUIDANCE}</p>
        </section>}

        {step === "calculadora" && result && input && <ResultShell icon={<Calculator/>} label="EXPERIENCIA A" title="Calculadora básica" subtitle="Mismos datos. Solo reglas y matemáticas." back={() => go("datos")} next={() => go("explicacion")} nextLabel="Ver explicación">
          <CalculatorView input={input} result={result}/>
        </ResultShell>}

        {step === "explicacion" && result && input && <ResultShell icon={<Brain/>} label="EXPERIENCIA B" title="Explicación tipo IA" subtitle="Mismos resultados, escritos en lenguaje sencillo." back={() => go("calculadora")} next={() => go("prueba")} nextLabel="Comprobar comprensión">
          <ExplanationView input={input} result={result}/>
        </ResultShell>}

        {step === "prueba" && result && input && <section className="panel quiz-panel">
          <div className="panel-heading"><div><p className="step-kicker">PASO 4</p><h2>Comprueba tu comprensión</h2><p>No buscamos que la IA gane. Si la calculadora basta, ese resultado también importa.</p></div></div>
          <Question id="total" label="¿Sabemos cuánto pagarás en total?" options={["Sí, con certeza", "No, faltan datos"]} answers={answers} setAnswers={setAnswers}/>
          <Question id="missing" label="¿Qué información principal falta en este ejemplo?" options={["Las comisiones", "El precio de compra", "Nada"]} answers={answers} setAnswers={setAnswers}/>
          <Question id="limit" label={result.limitStatus === "not_set" ? "¿Hay un límite opcional activo?" : "¿La cuota supera tu límite opcional?"} options={result.limitStatus === "not_set" ? ["Sí", "No"] : ["Sí", "No"]} answers={answers} setAnswers={setAnswers}/>
          <Question id="use" label="¿Usarías esta herramienta antes de comprar?" options={["Sí", "Tal vez", "No"]} answers={answers} setAnswers={setAnswers}/>
          <label className="field full"><span>¿Cuál experiencia te ayudó más y por qué? <small>OPCIONAL</small></span><textarea maxLength={300} value={answers.why ?? ""} onChange={(e) => setAnswers((old) => ({ ...old, why: e.target.value }))} placeholder="Tu respuesta no se envía ni se guarda."/></label>
          {!submitted ? <button className="primary full-button" disabled={!answers.total || !answers.missing || !answers.limit || !answers.use} onClick={() => setSubmitted(true)}>Marcar autoevaluación como completada <Check size={18}/></button> : <div className="feedback"><Check/><div><h3>Autoevaluación completada · sin calificación</h3><p>El total final {result.verifiedFinalTotalCents === undefined ? "sigue desconocido" : `es ${formatMxn(result.verifiedFinalTotalCents)}`}. Esto confirma que terminaste las preguntas; no valida que cada respuesta sea correcta ni cuenta como evidencia de usuarios.</p><div className="next-check"><b>Antes de decidir, quizá necesites confirmar:</b><ul>{NEXT_INFORMATION_TO_CONFIRM.map((item) => <li key={item}>{item}</li>)}</ul><p>Tú decides; esta lista no aprueba ni prohíbe la compra.</p></div></div></div>}
          <div className="actions"><button className="ghost" onClick={() => go("datos")}><Pencil size={16}/> Editar datos</button><button className="secondary" onClick={() => { setAnswers({}); setSubmitted(false); }}>Reiniciar prueba</button></div>
        </section>}
      </div>

      <footer><span>Debt Check MX · Proyecto académico</span><span>Tú tienes la última decisión.</span></footer>
    </main>
  );
}

function Trust({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <div className="trust"><span>{icon}</span><div><b>{title}</b><p>{text}</p></div></div>; }
type ControlledFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
  label: string; value: string; onChange: (value: string) => void;
};
function Field({ label, value, onChange, ...props }: ControlledFieldProps) { return <label className="field"><span>{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} {...props}/></label>; }
function MoneyField({ label, value, onChange, hint, allowNegative, ...props }: ControlledFieldProps & { hint?: string; allowNegative?: boolean }) { return <label className="field"><span>{label} <Info size={14}/></span><div className="money-input"><span>$</span><input value={value} onChange={(e) => onChange(e.target.value)} inputMode="decimal" pattern={allowNegative ? "-?[0-9,.]*" : "[0-9,.]*"} placeholder="0" {...props}/><em>MXN</em></div>{hint && <small>{hint}</small>}</label>; }
function ResultShell({ icon, label, title, subtitle, back, next, nextLabel, children }: { icon: React.ReactNode; label: string; title: string; subtitle: string; back: () => void; next: () => void; nextLabel: string; children: React.ReactNode }) { return <section className="panel result-panel"><div className="result-header"><div className="result-icon">{icon}</div><div><p className="step-kicker">{label}</p><h2>{title}</h2><p>{subtitle}</p></div></div>{children}<div className="actions"><button className="ghost" onClick={back}><ChevronLeft size={18}/> Atrás</button><button className="primary" onClick={next}>{nextLabel}<ArrowRight size={18}/></button></div></section>; }
function CalculatorView({ input, result }: { input: FinancingInput; result: ReturnType<typeof calculateFinancing> }) { const payment = input.advertisedInstallmentCents; return <div className="calculator-layout"><div className="amount-card"><span>Mensualidad anunciada</span><strong>{payment === undefined ? "DESCONOCIDA" : formatMxn(payment)}</strong><small>Dato capturado · no incluye cargos desconocidos</small></div><div className="metric-grid">{result.facts.slice(1, 4).map((fact) => <div className="metric" key={fact.label}><span>{fact.label}</span><b>{fact.value}</b><small className={`tag ${fact.knowledge.toLowerCase()}`}>{fact.knowledge}</small></div>)}</div><StatusCards input={input} result={result}/></div>; }
function StatusCards({ input, result }: { input: FinancingInput; result: ReturnType<typeof calculateFinancing> }) { const limitMessage = getLimitMessage(result); const materialUnknowns = hasMaterialUnknowns(result); const obligationContext = getObligationContext(input); const contextualWarnings = result.warnings.filter((warning) => !(input.incomePattern === "irregular" && warning.startsWith("El ingreso es irregular")) && !(obligationContext.knownGroups.length && warning === "Hay pagos conocidos que coinciden en la misma fecha.")); return <div className="status-stack">{limitMessage && <div className={`notice ${limitMessage.tone === "warning" ? "warn" : limitMessage.tone === "neutral" ? "info" : "good"}`}>{limitMessage.tone === "warning" ? <AlertTriangle/> : <Info/>}<div><b>{limitMessage.title}</b><p>{limitMessage.detail}</p></div></div>}{result.budgetStatus === "unknown" ? <div className="notice warn"><AlertTriangle/><div><b>No se puede confirmar capacidad mensual</b><p>El presupuesto capturado es una estimación. Con ingreso irregular, no sabemos si esa cantidad estará disponible cada mes.</p></div></div> : <div className={`notice ${result.budgetStatus === "exceeds" ? "warn" : materialUnknowns ? "info" : "good"}`}><Info/><div><b>{result.budgetStatus === "within" ? "La cuota anunciada está debajo del presupuesto capturado" : "La cuota anunciada supera el presupuesto capturado"}</b><p>{result.budgetStatus === "within" && materialUnknowns ? "Esto no confirma que la compra sea asequible: el costo final u otros datos siguen desconocidos." : "Es una comparación matemática, no una aprobación ni una recomendación de compra."}</p></div></div>}{obligationContext.knownGroups.map((message) => <div className="notice info" key={message}><Info/><div><b>Compromisos conocidos en la misma fecha</b><p>{message} El presupuesto capturado debe reflejar si ya los descontaste; la calculadora no los resta otra vez.</p>{obligationContext.newInstallmentOverlapUnknown && <p>Las fechas de las nuevas mensualidades son desconocidas, así que no se puede confirmar si coincidirán con estas obligaciones.</p>}</div></div>)}{contextualWarnings.map((warning) => <div className="notice warn" key={warning}><AlertTriangle/><div><b>Revisa</b><p>{warning}</p></div></div>)}<div className="missing"><h3>Información que falta</h3>{result.missing.length ? <ul>{result.missing.map((item) => <li key={item}>{item}</li>)}</ul> : <p>No detectamos campos desconocidos en esta captura.</p>}</div></div>; }
function ExplanationView({ input, result }: { input: FinancingInput; result: ReturnType<typeof calculateFinancing> }) {
  const [consent, setConsent] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [providerExplanation, setProviderExplanation] = useState<ExplanationResponse>();
  const payment = input.advertisedInstallmentCents;
  const limitMessage = getLimitMessage(result);
  const summary = payment === undefined ? "No conocemos la cuota anunciada, así que no podemos compararla." : limitMessage?.title ?? "No elegiste un límite opcional para esta cuota.";
  const uncertain = hasMaterialUnknowns(result);

  async function requestExplanation() {
    setLoading(true);
    try {
      const response = await fetch("/api/explain", { method: "POST", headers: { "Content-Type": "application/json", "x-demo-access-token": accessCode }, body: JSON.stringify({ input, consent: true }) });
      const data = await response.json() as { explanation?: ExplanationResponse };
      if (data.explanation) setProviderExplanation(data.explanation);
    } finally { setLoading(false); }
  }

  return <div className="ai-view">
    <div className={`simulation ${providerExplanation?.mode === "real" ? "real" : ""}`}><Sparkles size={18}/><b>{providerExplanation?.label ?? "SIMULATED AI OUTPUT"}</b><span>{providerExplanation?.mode === "real" ? "Google Gemini · explicación externa" : "Modo explicativo determinista · no usa un modelo externo"}</span></div>
    <div className={`ai-summary ${uncertain ? "uncertain" : ""}`}><Info/><div><h3>{summary}</h3>{uncertain && <p>Esta comparación no confirma que la compra sea asequible. Aún falta información importante.</p>}</div></div>
    {providerExplanation?.mode === "real" ? <div className="prose">{providerExplanation.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div> : <div className="prose"><p>{payment === undefined ? "La mensualidad anunciada es desconocida." : `La mensualidad que capturaste es ${formatMxn(payment)}.`} {result.budgetStatus === "within" ? "Está debajo del presupuesto mensual que ingresaste, pero eso no demuestra capacidad de pago futura." : result.budgetStatus === "exceeds" ? "Supera el presupuesto mensual que ingresaste." : "No podemos confirmar si cabe cada mes porque el ingreso es irregular o faltan datos."}</p><p>{result.feeKnowledge === "UNKNOWN" ? "No conocemos las comisiones. Por eso el total final todavía es desconocido." : `Las comisiones registradas son ${formatMxn(result.knownFeesCents ?? 0)} y el total verificable con estos datos es ${formatMxn(result.verifiedFinalTotalCents ?? 0)}.`} Las fechas que no ingresaste también permanecen desconocidas.</p><p>Esto no predice el futuro ni te dice si debes comprar. <b>Tú tienes la última decisión.</b></p></div>}
    <div className="ai-consent"><p><b>Explicación externa opcional</b> · El cálculo permanece en tu navegador. Si aceptas, solo los datos ficticios estructurados se envían a Google Gemini. Google puede aplicar sus políticas de retención y uso de datos.</p><label className="check"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)}/><span>Entiendo que los datos ficticios de este ejemplo se enviarán a un proveedor externo de IA para generar la explicación.</span></label><label className="field"><span>Código de acceso del demo</span><input type="password" maxLength={100} autoComplete="off" value={accessCode} onChange={(event) => setAccessCode(event.target.value)} placeholder="No es tu clave de Gemini"/><small>{DEMO_ACCESS_GUIDANCE}</small></label><button className="secondary" disabled={!consent || !accessCode || loading} onClick={requestExplanation}>{loading ? <LoaderCircle className="spin"/> : <Sparkles/>}{loading ? "Generando…" : "Generar explicación con IA"}</button></div>
    <StatusCards input={input} result={result}/><div className="same-facts"><ShieldCheck/><div><b>Mismos datos, misma aritmética</b><p>La IA no cambia ninguna cifra de la calculadora.</p></div></div>
  </div>;
}
function Question({ id, label, options, answers, setAnswers }: { id: string; label: string; options: string[]; answers: Record<string, string>; setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>> }) { return <fieldset className="question"><legend>{label}</legend><div>{options.map((option) => <label key={option} className={answers[id] === option ? "selected" : ""}><input type="radio" name={id} value={option} checked={answers[id] === option} onChange={() => setAnswers((old) => ({ ...old, [id]: option }))}/><span>{option}</span></label>)}</div></fieldset>; }
