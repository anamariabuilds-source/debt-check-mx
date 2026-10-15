"use client";

import { useState } from "react";
import { Eye, ImageUp, LoaderCircle, ShieldAlert, X } from "lucide-react";
import type { VisionExtraction } from "@/lib/ai/vision";
import { buildVisionProposal } from "@/lib/ai/vision-proposal";

export interface VisionProposal {
  price?: string;
  count?: string;
  installment?: string;
  feeStatus?: "unknown" | "confirmed_zero" | "known";
  fees?: string;
  paymentDates?: string;
}

type Draft = { price: string; count: string; installment: string; fees: string; paymentDates: string };

export function VisionOffer({ onApply }: { onApply: (proposal: VisionProposal) => void }) {
  const [file, setFile] = useState<File>();
  const [consent, setConsent] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [extraction, setExtraction] = useState<VisionExtraction>();
  const [draft, setDraft] = useState<Draft>({ price: "", count: "", installment: "", fees: "", paymentDates: "" });
  const [selected, setSelected] = useState<Record<keyof Draft, boolean>>({ price: true, count: true, installment: true, fees: true, paymentDates: true });

  async function readOffer() {
    if (!file || !consent || !accessCode) return;
    setLoading(true); setError(""); setExtraction(undefined);
    try {
      const body = new FormData(); body.set("image", file); body.set("consent", "true");
      const response = await fetch("/api/vision", { method: "POST", headers: { "x-demo-access-token": accessCode }, body });
      const data = await response.json() as { extraction?: VisionExtraction; error?: string };
      if (!response.ok || !data.extraction) throw new Error(data.error ?? "No pudimos leer la imagen.");
      const value = data.extraction;
      setExtraction(value);
      setDraft({
        price: value.purchasePrice?.toString() ?? "", count: value.installmentCount?.toString() ?? "",
        installment: value.advertisedInstallment?.toString() ?? "", fees: value.knownFees?.toString() ?? "",
        paymentDates: value.dueDates.join(", "),
      });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No pudimos leer la imagen."); }
    finally { setLoading(false); }
  }

  function applySelected() {
    if (!extraction) return;
    onApply(buildVisionProposal(extraction, draft, selected)); setExtraction(undefined); setFile(undefined);
  }

  return <section className="vision-box" aria-labelledby="vision-title">
    <div className="vision-heading"><span><ImageUp/></span><div><h3 id="vision-title">Leer una oferta de ejemplo con IA <em>OPCIONAL</em></h3><p>Sube una captura ficticia de una oferta de financiamiento. Revisa y confirma cualquier dato antes de usarlo.</p></div></div>
    <div className="vision-disclosure"><ShieldAlert/><p>La imagen se enviará a Google Gemini para procesarla externamente. Usa solo ejemplos ficticios, nunca estados de cuenta ni documentos personales. Aplican las políticas de retención y uso de datos de Google.</p></div>
    <div className="vision-controls">
      <label className="field"><span>Imagen ficticia (PNG, JPEG o WebP; máximo 2 MB)</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setFile(event.target.files?.[0])}/></label>
      <label className="field"><span>Código de acceso del demo</span><input type="password" maxLength={100} autoComplete="off" value={accessCode} onChange={(event) => setAccessCode(event.target.value)} placeholder="No es tu clave de Gemini"/></label>
    </div>
    <label className="check"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)}/><span>Entiendo que esta imagen ficticia se enviará a un proveedor externo de IA para extraer datos visibles.</span></label>
    <button className="secondary" disabled={!file || !consent || !accessCode || loading} onClick={readOffer}>{loading ? <LoaderCircle className="spin"/> : <Eye/>}{loading ? "Leyendo…" : "Leer oferta ficticia"}</button>
    {error && <p className="error" role="alert">{error} Puedes continuar manualmente.</p>}
    {extraction && <div className="vision-preview"><div><b>PROPUESTA NO VERIFICADA</b><p>Corrige, selecciona y confirma cada dato que quieras transferir. Nada se aplica automáticamente.</p></div>
      <ProposalField label="Precio de compra" field="price" draft={draft} setDraft={setDraft} selected={selected} setSelected={setSelected}/>
      <ProposalField label="Número de mensualidades" field="count" draft={draft} setDraft={setDraft} selected={selected} setSelected={setSelected}/>
      <ProposalField label="Mensualidad anunciada" field="installment" draft={draft} setDraft={setDraft} selected={selected} setSelected={setSelected}/>
      <ProposalField label={extraction.feeStatus === "UNKNOWN" ? "Comisiones: DESCONOCIDAS" : "Comisiones visibles"} field="fees" draft={draft} setDraft={setDraft} selected={selected} setSelected={setSelected}/>
      <ProposalField label="Fechas visibles" field="paymentDates" draft={draft} setDraft={setDraft} selected={selected} setSelected={setSelected}/>
      {extraction.uncertainFields.length > 0 && <p className="vision-uncertain">Campos ambiguos: {extraction.uncertainFields.join(", ")}. Revísalos antes de confirmar.</p>}
      <div className="vision-actions"><button className="ghost" onClick={() => setExtraction(undefined)}><X/> Rechazar extracción</button><button className="primary" onClick={applySelected}>Aplicar datos seleccionados</button></div>
    </div>}
  </section>;
}

function ProposalField({ label, field, draft, setDraft, selected, setSelected }: { label: string; field: keyof Draft; draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>>; selected: Record<keyof Draft, boolean>; setSelected: React.Dispatch<React.SetStateAction<Record<keyof Draft, boolean>>> }) {
  return <label className="proposal-field"><input type="checkbox" checked={selected[field]} onChange={(event) => setSelected((old) => ({ ...old, [field]: event.target.checked }))}/><span>{label}</span><input value={draft[field]} onChange={(event) => setDraft((old) => ({ ...old, [field]: event.target.value }))} placeholder="DESCONOCIDO"/></label>;
}
