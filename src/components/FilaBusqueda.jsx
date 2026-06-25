import { useState, useEffect } from 'react';

/**
 * Representa una fila individual de búsqueda compacta.
 * Muestra el resultado (Badge) al lado del input.
 * Optimizado con estado local y debounce para evitar lag al escribir.
 */
const FilaBusqueda = ({ 
  index, 
  value, 
  onChange, 
  onOpenDetails, 
  onDelete, 
  productoAnalizado 
}) => {
  const isValid = productoAnalizado?.valido || false;
  const modelName = productoAnalizado?.model_na || '';
  const isRefurb = productoAnalizado?.resultadoCompleto?.isRefurbished;

  // Estado local para evitar lag de tipeo y accesos excesivos a disco
  const [prevValue, setPrevValue] = useState(value);
  const [localValue, setLocalValue] = useState(value);

  // Ajustar estado si el valor prop cambia externamente (ej: reset)
  if (value !== prevValue) {
    setPrevValue(value);
    setLocalValue(value);
  }


  // Propagación diferida (debounce) para no saturar Zustand ni guardar en LocalStorage por cada letra
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(index, localValue);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [localValue, index, onChange, value]);

  const handleBlur = () => {
    if (localValue !== value) {
      onChange(index, localValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && localValue !== value) {
      onChange(index, localValue);
    }
  };

  return (
    <div className="flex flex-row items-center gap-3 mb-3 animate-in fade-in slide-in-from-left-4 duration-300" style={{ animationDelay: `${index * 50}ms` }}>

      {/* Indicador de Fila */}
      <div className="flex-none w-8 h-8 flex items-center justify-center bg-bg-number text-primary font-fjalla rounded-lg border border-primary/20 shadow-sm text-xs transition-colors duration-300">
        {index + 1}
      </div>

      {/* Input de Serial Compacto */}
      <div className="flex-none">
        <input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Serial..."
          maxLength={30}
          className={`w-50 md:w-60 px-3 py-2 bg-surface border-2 rounded-xl outline-none transition-all font-medium text-sm text-text-main ${
            localValue 
              ? isValid 
                ? 'border-primary/50 focus:border-primary shadow-primary/5' 
                : 'border-red-500/50 focus:border-red-500 bg-red-500/5'
              : 'border-border-main focus:border-primary/40'
          }`}
        />
      </div>


      {/* Badge de Modelo (Al lado del input) */}
      <div className="grow min-w-0 flex items-center">
        {isValid && (
          <div 
            className={`w-40 px-3 py-1.5 rounded-lg border flex justify-between gap-2 overflow-hidden transition-colors duration-300 ${
              isRefurb 
                ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' 
                : 'bg-primary/10 border-primary/20 text-primary'
            }`}
          >
            <span className="text-[16px] font-fjalla uppercase tracking-wider truncate">
              {isRefurb ? `${modelName}-FC` : modelName}
            </span>
            <svg onClick={() => onOpenDetails(index)} className="cursor-pointer w-5 h-5 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
      </div>

      {/* Botones de Acción */}
      <div className="flex-none flex flex-row gap-2">
        {index > 0 && (
          <button
            onClick={() => onDelete(index)}
            title="Remove row"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95 border border-red-500/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default FilaBusqueda;



