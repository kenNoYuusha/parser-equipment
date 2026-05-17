import React from 'react';

/**
 * Representa una fila individual de búsqueda en el sistema por lotes.
 */
const FilaBusqueda = ({ index, value, onChange, onOpenDetails, onDelete, isValid }) => {
  return (
    <div className="flex flex-row items-center gap-3 mb-4 animate-in fade-in slide-in-from-left-4 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
      {/* Indicador de Fila */}
      <div className="flex-none w-10 h-10 flex items-center justify-center bg-dark text-primary font-fjalla rounded-xl border border-primary/20 shadow-sm text-sm">
        #{index + 1}
      </div>

      {/* Input de Serial */}
      <div className="grow relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(index, e.target.value)}
          placeholder="Enter Serial Number..."
          className={`w-full px-5 py-3 bg-white border-2 rounded-xl outline-none transition-all font-medium text-sm md:text-base ${
            value 
              ? isValid 
                ? 'border-primary/50 focus:border-primary shadow-primary/5' 
                : 'border-red-200 focus:border-red-400 bg-red-50/30'
              : 'border-dark/10 focus:border-primary/40'
          }`}
        />
      </div>

      {/* Botones de Acción */}
      <div className="flex flex-row gap-2">
        {/* Botón de Detalles */}
        <button
          onClick={() => onOpenDetails(index)}
          disabled={!isValid}
          title={isValid ? "View report" : "Valid serial required"}
          className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all ${
            isValid
              ? 'bg-primary text-white hover:bg-primary/90 shadow-md active:scale-95'
              : 'bg-dark/5 text-dark/20 cursor-not-allowed border border-dark/5'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>

        {/* Botón de Eliminar (Solo a partir de la segunda fila) */}
        {index > 0 && (
          <button
            onClick={() => onDelete(index)}
            title="Remove row"
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default FilaBusqueda;
