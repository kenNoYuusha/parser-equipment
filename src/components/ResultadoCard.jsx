import React from 'react';

/**
 * Componente presentacional para mostrar los resultados del análisis.
 * Rediseñado con Tailwind CSS para una visualización profesional.
 * Ajustado para integrarse perfectamente en contenedores/modales.
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
      <div className="bg-red-50 border-2 border-red-200 p-6 rounded-2xl flex items-start space-x-4 m-4">
        <div className="bg-red-500 text-white p-2 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div>
          <h3 className="text-red-800 font-bold uppercase text-sm tracking-widest mb-1">Invalid Serial</h3>
          <p className="text-red-700">The entered format does not match any registered equipment patterns. Please verify and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white animate-in fade-in duration-500">
      {/* Header con Serial (izquierda) y Estatus Refurbished (derecha) */}
      <div className="bg-dark p-6 text-white flex justify-between items-center">
        <h2 className="text-2xl md:text-3xl text-primary mb-0 font-fjalla tracking-widest uppercase">
          {codigoOriginal}
        </h2>
        
        {isRefurbished && (
          <div className="flex items-center space-x-2 bg-orange-500/10 border border-orange-500/40 px-4 py-2 rounded-xl animate-pulse">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            <span className="text-orange-400 font-fjalla uppercase tracking-[0.2em] text-sm md:text-base font-bold">
              Refurbished
            </span>
          </div>
        )}
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Technical Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 border-b border-dark/5 pb-3">
              <div className="w-2 h-6 bg-primary rounded-full"></div>
              <h3 className="text-lg text-dark font-fjalla uppercase">Technical Specifications</h3>
            </div>
            
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DataField label="Marketing Code" value={letraMercadeo} />
              <DataField label="Model ID" value={modelo} highlight />
              <DataField label="Production Date" value={fechaFormateada} subValue={`Raw Code: ${fecha}`} highlight />
              <DataField label="Correlative" value={correlativo} />
            </dl>
          </div>

          {/* Commercial Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 border-b border-dark/5 pb-3">
              <div className="w-2 h-6 bg-primary rounded-full"></div>
              <h3 className="text-lg text-dark font-fjalla uppercase">Commercial Information</h3>
            </div>

            {datosComerciales ? (
              <div className="bg-light p-5 rounded-2xl space-y-4 border border-dark/5 relative">
                {datosComerciales.discontinued?.toUpperCase() === 'TRUE' && (
                  <span className="absolute top-2 right-2 text-red-500 font-bold text-xs tracking-wider bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    DISCONTINUED
                  </span>
                )}
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-dark/40 block mb-1 font-bold">Product</span>
                  <span className="text-dark font-bold text-lg leading-tight block">{datosComerciales.producto}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-dark/40 block mb-1 font-bold">Category</span>
                    <span className="text-dark/80 text-sm font-medium">{datosComerciales.categoria}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-dark/40 block mb-1 font-bold">Model</span>
                    <a className="text-primary text-sm font-bold" target="_blank" rel="noopener noreferrer" href={`https://egopowerplus.com/catalogsearch/result/?q=${datosComerciales.model_na}`}>{isRefurbished ? `${datosComerciales.model_na}-FC` : datosComerciales.model_na}</a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 bg-light/50 border-2 border-dashed border-dark/10 rounded-2xl text-center">
                <span className="text-3xl mb-3 opacity-50">🔍</span>
                <p className="text-dark/40 text-sm italic">
                  No commercial information found for model <span className="text-dark font-bold">"{modelo}"</span> in the synchronized database.
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
  <div className="bg-light/50 p-3 rounded-xl border border-dark/5">
    <dt className="text-[10px] uppercase tracking-widest text-dark/40 font-bold mb-1">{label}</dt>
    <dd className={`text-sm font-bold ${highlight ? 'text-primary' : 'text-dark/80'}`}>{value}</dd>
    {subValue && <dd className="text-[9px] text-dark/30 mt-1 uppercase font-medium font-lato">{subValue}</dd>}
  </div>
);

export default ResultadoCard;
