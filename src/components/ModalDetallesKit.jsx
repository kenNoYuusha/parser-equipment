import { useEffect } from 'react';

/**
 * Modal to display kit configuration details:
 * Lists the models that compose the kit (tools, batteries, chargers)
 * and highlights which ones are already matched in the user's inputs.
 */
const ModalDetallesKit = ({ isOpen, onClose, kit, productosAnalizados }) => {
  // Close with Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !kit) return null;

  // Extract tools, batteries, and chargers from the kit
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

  // Count user inventory of validated products to match them visually
  const userInventory = (productosAnalizados || [])
    .filter(p => p?.valido && p.model_na)
    .reduce((acc, p) => {
      const model = p.model_na.trim().replace(/\s+/g, '').toUpperCase();
      acc[model] = (acc[model] || 0) + 1;
      return acc;
    }, {});

  // Copy of inventory to decrement counts as we check off requirements
  const matchedInventory = { ...userInventory };

  const getStatus = (modelName) => {
    const normName = modelName.replace(/\s+/g, '').toUpperCase();
    if (matchedInventory[normName] > 0) {
      matchedInventory[normName]--;
      return { present: true, label: 'Matched' };
    }
    return { present: false, label: 'Missing' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto bg-surface rounded-4xl shadow-2xl animate-in zoom-in-95 duration-300 border border-border-main p-6 sm:p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-main pb-4 mb-6">
          <div>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-primary font-bold">Kit Specifications</span>
            <h2 className="text-2xl font-fjalla text-text-main uppercase tracking-wider mt-1">
              Model: <span className="text-primary">{kit.model_id}</span>
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-text-muted hover:text-text-main p-2 rounded-xl hover:bg-text-main/5 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Component Lists */}
        <div className="space-y-6">
          {/* Tools Section */}
          {tools.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Required Tools ({tools.length})
              </h3>
              <div className="space-y-2">
                {tools.map((tool, i) => {
                  const status = getStatus(tool);
                  return <ComponentRow key={i} name={tool} status={status} />;
                })}
              </div>
            </div>
          )}

          {/* Batteries Section */}
          {batteries.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Required Batteries ({batteries.length})
              </h3>
              <div className="space-y-2">
                {batteries.map((battery, i) => {
                  const status = getStatus(battery);
                  return <ComponentRow key={i} name={battery} status={status} />;
                })}
              </div>
            </div>
          )}

          {/* Chargers Section */}
          {chargers.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Required Chargers ({chargers.length})
              </h3>
              <div className="space-y-2">
                {chargers.map((charger, i) => {
                  const status = getStatus(charger);
                  return <ComponentRow key={i} name={charger} status={status} />;
                })}
              </div>
            </div>
          )}

          {/* Product Description */}
          {kit.product_description && (
            <div className="mt-6 pt-4 border-t border-border-main">
              <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted block mb-1.5 font-bold">Description</span>
              <p className="text-text-main text-sm font-medium leading-relaxed bg-text-main/5 p-4 rounded-2xl border border-border-main">
                {kit.product_description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ComponentRow = ({ name, status }) => (
  <div className="flex items-center justify-between p-3 bg-text-main/5 border border-border-main rounded-xl">
    <span className="font-fjalla text-sm tracking-wide text-text-main">{name}</span>
    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg border transition-all ${
      status.present 
        ? 'bg-primary/10 border-primary/20 text-primary' 
        : 'bg-text-main/5 border-border-main text-text-muted opacity-60'
    }`}>
      {status.label}
    </span>
  </div>
);

export default ModalDetallesKit;
