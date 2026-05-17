import React, { useState } from 'react';
import { useModels } from '../hooks/useModels';
import ResultadoCard from './ResultadoCard';

/**
 * Componente Buscador: Orquestador de la lógica de búsqueda y visualización.
 * Rediseñado con Tailwind CSS y UX mejorada.
 */
const Buscador = () => {
  const { diccionarioModelos, cargando, error, enriquecerNumeroSerie } = useModels();
  const [inputValue, setInputValue] = useState('');
  const [resultado, setResultado] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const dataEnriquecida = enriquecerNumeroSerie(inputValue, diccionarioModelos);
    setResultado(dataEnriquecida);
  };

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-dark/70 font-medium">Cargando base de datos comercial...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="text-red-800 font-bold uppercase tracking-tight">Error de Conexión</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <header className="text-center mb-12">
        <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-4 uppercase tracking-widest">
          Analizador de Hardware
        </div>
        <h1 className="text-4xl md:text-5xl text-dark mb-4">
          Sistema de Verificación
        </h1>
        <p className="text-dark/60 text-lg max-w-xl mx-auto leading-relaxed">
          Ingrese el número de serie para obtener el análisis técnico y comercial detallado del equipo.
        </p>
      </header>

      <form 
        onSubmit={handleSearch} 
        className="relative group max-w-2xl mx-auto mb-16 transition-all duration-300"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ej: MJK15181500001X"
              className="w-full px-6 py-4 bg-white border-2 border-dark/10 rounded-xl focus:border-primary outline-none transition-all text-lg placeholder:text-dark/30 shadow-sm group-hover:shadow-md"
            />
          </div>
          <button 
            type="submit" 
            className="px-8 py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-primary/30 active:scale-[0.98] whitespace-nowrap uppercase tracking-wide"
          >
            Analizar Serial
          </button>
        </div>
      </form>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <ResultadoCard resultado={resultado} />
      </div>
    </div>
  );
};

export default Buscador;
