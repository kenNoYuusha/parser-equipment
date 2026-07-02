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
    <div className="flex flex-row items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-300" style={{ animationDelay: `${index * 50}ms` }}>

      {/* Columna 1: Número e Input de Serial */}
      <div className="flex-none flex items-center gap-2 w-72">
        {/* Indicador de Fila */}
        <div className="flex-none w-8 h-8 flex items-center justify-center bg-bg-number text-primary font-fjalla rounded-lg border border-primary/20 shadow-sm text-xs transition-colors duration-300">
          {index + 1}
        </div>

        {/* Input con Botón de Eliminar Integrado */}
        <div className="relative flex-grow">
          <input
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Serial..."
            maxLength={30}
            className={`w-full pl-3 pr-8 py-2 bg-surface border-2 rounded-xl outline-none transition-all font-medium text-sm text-text-main ${
              localValue 
                ? isValid 
                  ? 'border-primary/50 focus:border-primary shadow-primary/5' 
                  : 'border-red-500/50 focus:border-red-500 bg-red-500/5'
                : 'border-border-main focus:border-primary/40'
            }`}
          />
          {index > 0 && (
            <button
              onClick={() => onDelete(index)}
              title="Remove row"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-500/10 active:scale-95 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Columna 2: Badge de Modelo (Al lado del input) */}
      <div className="flex-none w-40 flex items-center">
        {isValid && (
          <div 
            className={`w-full px-3 py-1.5 rounded-lg border flex justify-between items-center gap-2 overflow-hidden transition-colors duration-300 ${
              isRefurb 
                ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' 
                : 'bg-primary/10 border-primary/20 text-primary'
            }`}
          >
            <span className="text-[16px] font-fjalla uppercase tracking-wider truncate">
              {isRefurb ? `${modelName}-FC` : modelName}
            </span>
            <svg onClick={() => onOpenDetails(index)} className="cursor-pointer w-4 h-4 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
      </div>

    </div>
  );
};

export default FilaBusqueda;



