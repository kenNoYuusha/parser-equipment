/**
 * Componente presentacional para mostrar los resultados del análisis.

 * Adaptado para soportar temas dinámicos.
 */
const ResultadoCard = ({ resultado }) => {
  if (!resultado) return null;

  const { 
    valido, 
    codigoOriginal,
    isRefurbished,
    letraMercadeo, 
    modelo, 
    fecha, 
    fechaFormateada,
    correlativo, 
    datosComerciales 
  } = resultado;

  if (!valido) {
    return (
      <div className="bg-red-500/10 border-2 border-red-500/20 p-6 rounded-2xl flex items-start space-x-4 m-4">
        <div className="bg-red-500 text-white p-2 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div>
          <h3 className="text-red-500 font-bold uppercase text-sm tracking-widest mb-1">Invalid Serial</h3>
          <p className="text-red-500/80 text-sm">The entered format does not match any registered equipment patterns.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface animate-in fade-in transition-colors duration-300">
      {/* Header con Serial */}
      <div className="bg-primary p-6 text-white flex justify-between items-center">
        <h2 className="text-2xl md:text-3xl text-white mb-0 font-fjalla tracking-widest uppercase">
          {codigoOriginal}
        </h2>
        
        {isRefurbished && (
          <div className="flex items-center space-x-2 bg-black/20 border border-white/40 px-4 py-2 rounded-xl">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            <span className="text-white font-fjalla uppercase tracking-[0.2em] text-xs md:text-sm font-bold">
              Refurbished
            </span>
          </div>
        )}
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Technical Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 border-b border-border-main pb-3">
              <div className="w-2 h-6 bg-primary rounded-full"></div>
              <h3 className="text-lg text-text-main font-fjalla uppercase">Technical Specs</h3>
            </div>
            
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DataField label="Marketing Code" value={letraMercadeo?.toUpperCase()} />
              <DataField label="Model ID" value={modelo} highlight />
              <DataField label="Production Date" value={fechaFormateada} subValue={`Raw: ${fecha}`} highlight />
              <DataField label="Correlative" value={correlativo} />
            </dl>
          </div>

          {/* Commercial Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 border-b border-border-main pb-3">
              <div className="w-2 h-6 bg-primary rounded-full"></div>
              <h3 className="text-lg text-text-main font-fjalla uppercase">Commercial Info</h3>
            </div>

            {datosComerciales ? (
              <div className="bg-text-main/5 p-5 rounded-2xl space-y-4 border border-border-main relative">
                {datosComerciales.discontinued?.toUpperCase() === 'TRUE' && (
                  <span className="absolute top-2 right-2 text-red-500 font-bold text-[8px] tracking-wider bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                    DISCONTINUED
                  </span>
                )}
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted block mb-1 font-bold">Product</span>
                  <span className="text-text-main font-bold text-lg leading-tight block">{datosComerciales.producto}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted block mb-1 font-bold">Category</span>
                    <span className="text-text-main/80 text-sm font-medium">{datosComerciales.categoria}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted block mb-1 font-bold">Model</span>
                    <a className="text-primary text-sm font-bold inline-flex items-center gap-1 hover:underline" target="_blank" rel="noopener noreferrer" href={`https://egopowerplus.com/catalogsearch/result/?q=${datosComerciales.model_na}`}>
                      {isRefurbished ? `${datosComerciales.model_na}-FC` : datosComerciales.model_na}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 bg-text-main/5 border-2 border-dashed border-border-main rounded-2xl text-center">
                <span className="text-3xl mb-3 opacity-50">🔍</span>
                <p className="text-text-muted text-sm italic">
                  No commercial information found for model <span className="text-text-main font-bold">"{modelo}"</span>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DataField = ({ label, value, subValue, highlight = false }) => (
  <div className="bg-text-main/5 p-3 rounded-xl border border-border-main">
    <dt className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-1">{label}</dt>
    <dd className={`text-sm font-bold ${highlight ? 'text-primary' : 'text-text-main/80'}`}>{value}</dd>
    {subValue && <dd className="text-[9px] text-text-muted/60 mt-1 uppercase font-medium font-lato">{subValue}</dd>}
  </div>
);

export default ResultadoCard;
