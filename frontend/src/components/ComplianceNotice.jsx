import { ShieldCheck } from 'lucide-react'

export default function ComplianceNotice({ className = '' }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-blue-200 bg-blue-50/70 p-5 text-sm text-blue-900 shadow-inner ${className}`.trim()}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/80 to-blue-200/40" aria-hidden="true" />
      <div className="relative flex items-start gap-3">
        <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-md">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold uppercase tracking-wide text-blue-800 text-xs">Elektronický podpis a auditní stopa</p>
          <p>
            Dokument byl elektronicky podepsán v platformě <strong>Estate Private</strong>. Podpis ukládáme spolu s kompletním zněním smlouvy, otiskem
            <abbr title="SHA-256 kryptografický hash">SHA-256</abbr>, ověřovacím kódem a časem podpisu. Všechny údaje jsou součástí auditního logu a lze je kdykoliv zpětně ověřit.
          </p>
          <p className="text-xs text-blue-700">
            Ověření legitimity podpisu je možné porovnáním hash otisku s uloženou verzí a kontrolou auditních záznamů (včetně IP adresy, času a identifikace uživatele).
            Pro vyšší úroveň jistoty lze napojit kvalifikovaného poskytovatele důvěryhodných služeb dle eIDAS – je-li to požadováno, kontaktujte prosím administrátora.
          </p>
        </div>
      </div>
    </div>
  )
}
