import { useEffect } from 'react';

/**
 * Modal to display kit configuration details.
 * Design mirrors the individual model modal (ResultadoCard):
 * - Wide landscape container (max-w-4xl)
 * - Colored header band with kit model
 * - Two-column body: kit meta info on the left, component chips on the right
 * - Inline chip badges for each component (tool, battery, charger)
 */
const ModalDetallesKit = ({ isOpen, onClose, kit, productosAnalizados }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !kit) return null;

  // Extract components
  const tools = [kit.tool1, kit.tool2, kit.tool3, kit.tool4, kit.tool5]
    .filter(Boolean)
    .map(t => t.trim().toUpperCase());

  const batteries = [
    kit.battery1, kit.battery2, kit.battery3, kit.battery4,
    kit.battery5, kit.battery6, kit.battery7, kit.battery8
  ]
    .filter(Boolean)
    .map(b => b.trim().toUpperCase());

  const chargers = [kit.charger1, kit.charger2, kit.charger3]
    .filter(Boolean)
    .map(c => c.trim().toUpperCase());

  const totalComponents = tools.length + batteries.length + chargers.length;

  // User inventory for match highlighting
  const matchedInventory = (productosAnalizados || [])
    .filter(p => p?.valido && p.model_na)
    .reduce((acc, p) => {
      const model = p.model_na.trim().replace(/\s+/g, '').toUpperCase();
      acc[model] = (acc[model] || 0) + 1;
      return acc;
    }, {});

  const getStatus = (modelName) => {
    const normName = modelName.replace(/\s+/g, '').toUpperCase();
    if (matchedInventory[normName] > 0) {
      matchedInventory[normName]--;
      return true;
    }
    return false;
  };

  // Pre-compute statuses so they're consumed in order
  const toolStatuses   = tools.map(t => getStatus(t));
  const battStatuses   = batteries.map(b => getStatus(b));
  const chargeStatuses = chargers.map(c => getStatus(c));

  const matchedCount = [
    ...toolStatuses, ...battStatuses, ...chargeStatuses
  ].filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 transition-opacity"
        onClick={onClose}
      />

      {/* Modal — wide landscape, no padding at root (mirrors ResultadoCard container) */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-surface rounded-4xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden border border-border-main">

        {/* ── Header band ── mirrors ResultadoCard header */}
        <div className="bg-primary px-8 py-6 flex items-center justify-between">
          <div>
            <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.25em] mb-1">
              Kit Specifications
            </p>
            <h2 className="text-3xl font-fjalla uppercase tracking-widest text-white leading-none">
              {kit.model_id}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Match progress pill */}
            <div className="flex items-center gap-2 bg-black/20 border border-white/30 px-4 py-2 rounded-xl">
              <span className={`w-2 h-2 rounded-full ${matchedCount === totalComponents && totalComponents > 0 ? 'bg-white animate-pulse' : 'bg-white/40'}`} />
              <span className="text-white font-fjalla uppercase tracking-[0.15em] text-xs">
                {matchedCount} / {totalComponents} matched
              </span>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Body ── two-column grid like ResultadoCard */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* ── LEFT: Kit meta info ── */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 border-b border-border-main pb-3">
                <div className="w-2 h-6 bg-primary rounded-full" />
                <h3 className="text-lg text-text-main font-fjalla uppercase">Kit Info</h3>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <KitField label="Model ID" value={kit.model_id} highlight />
                <KitField label="Total Components" value={`${totalComponents} pcs`} />
                {kit.product_description && (
                  <div className="sm:col-span-2 bg-text-main/5 p-3 rounded-xl border border-border-main">
                    <dt className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-1">Description</dt>
                    <dd className="text-sm font-medium text-text-main/80 leading-relaxed">
                      {kit.product_description}
                    </dd>
                  </div>
                )}
              </dl>

              {/* Component count summary */}
              <div className="bg-text-main/5 p-4 rounded-2xl border border-border-main space-y-3">
                <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-bold block">Composition</span>
                <div className="flex flex-wrap gap-3">
                  {tools.length > 0 && (
                    <SummaryChip icon={<ToolIcon />} label="Tools" count={tools.length} />
                  )}
                  {batteries.length > 0 && (
                    <SummaryChip icon={<BattIcon />} label="Batteries" count={batteries.length} />
                  )}
                  {chargers.length > 0 && (
                    <SummaryChip icon={<ChargeIcon />} label="Chargers" count={chargers.length} />
                  )}
                </div>
              </div>
            </div>

            {/* ── RIGHT: Component chips ── */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 border-b border-border-main pb-3">
                <div className="w-2 h-6 bg-primary rounded-full" />
                <h3 className="text-lg text-text-main font-fjalla uppercase">Components</h3>
              </div>

              <div className="space-y-5">
                {/* Tools */}
                {tools.length > 0 && (
                  <ComponentSection
                    icon={<ToolIcon />}
                    label={`Tools (${tools.length})`}
                    items={tools}
                    statuses={toolStatuses}
                  />
                )}

                {/* Batteries */}
                {batteries.length > 0 && (
                  <ComponentSection
                    icon={<BattIcon />}
                    label={`Batteries (${batteries.length})`}
                    items={batteries}
                    statuses={battStatuses}
                  />
                )}

                {/* Chargers */}
                {chargers.length > 0 && (
                  <ComponentSection
                    icon={<ChargeIcon />}
                    label={`Chargers (${chargers.length})`}
                    items={chargers}
                    statuses={chargeStatuses}
                  />
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Sub-components ── */

const KitField = ({ label, value, highlight = false }) => (
  <div className="bg-text-main/5 p-3 rounded-xl border border-border-main">
    <dt className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-1">{label}</dt>
    <dd className={`text-sm font-bold ${highlight ? 'text-primary' : 'text-text-main/80'}`}>{value}</dd>
  </div>
);

const SummaryChip = ({ icon, label, count }) => (
  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg">
    <span className="text-primary w-3.5 h-3.5">{icon}</span>
    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{count}x {label}</span>
  </div>
);

const ComponentSection = ({ icon, label, items, statuses }) => (
  <div>
    <div className="flex items-center gap-1.5 mb-2">
      <span className="text-text-muted w-3.5 h-3.5">{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{label}</span>
    </div>
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span
          key={i}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-fjalla uppercase tracking-wider transition-all ${
            statuses[i]
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'bg-text-main/5 border-border-main text-text-muted opacity-60'
          }`}
        >
          {statuses[i] && (
            <svg className="w-3 h-3 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {item}
        </span>
      ))}
    </div>
  </div>
);

/* ── Icons ── */
const ToolIcon = () => (
  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const BattIcon = () => (
  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const ChargeIcon = () => (
  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

export default ModalDetallesKit;
