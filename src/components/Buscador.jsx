import React, { useState } from 'react';
import { useModels } from '../hooks/useModels';
import FilaBusqueda from './FilaBusqueda';
import ModalDetalles from './ModalDetalles';

/**
 * Componente Buscador: Refactorizado para procesamiento por lotes (Batch).
 */
const Buscador = () => {
  const { 
    cargando, 
    error, 
    productosAnalizados, 
    actualizarProductoAnalizado, 
    eliminarProductoAnalizado,
    resetearProductosAnalizados 
  } = useModels();
  
  const [listaSeries, setListaSeries] = useState([""]);
  const [modalOpen, setModalOpen] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);

  const handleInputChange = (index, valor) => {
    const nuevaLista = [...listaSeries];
    nuevaLista[index] = valor;
    setListaSeries(nuevaLista);
    actualizarProductoAnalizado(index, valor);
  };

  const agregarFila = () => {
    if (listaSeries.length < 5) {
      setListaSeries([...listaSeries, ""]);
    }
  };

  const eliminarFila = (index) => {
    if (index === 0 && listaSeries.length === 1) return;
    
    const nuevaLista = listaSeries.filter((_, i) => i !== index);
    setListaSeries(nuevaLista);
    eliminarProductoAnalizado(index);
  };

  const resetearTodo = () => {
    setListaSeries([""]);
    resetearProductosAnalizados();
  };

  const abrirDetalles = (index) => {
    const producto = productosAnalizados[index];
    if (producto && producto.valido) {
      setItemSeleccionado(producto.resultadoCompleto);
      setModalOpen(true);
    }
  };

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 space-y-4 font-lato">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-dark/70 font-medium">Synchronizing Commercial Database...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <header className="text-center mb-16 animate-in fade-in duration-700">
        <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full mb-6 uppercase tracking-[0.2em] border border-primary/20">
          Batch Processing System
        </div>
        <h1 className="text-2xl md:text-4xl text-dark mb-6">
          Serial Verification
        </h1>
        <p className="text-dark/50 text-xl max-w-2xl mx-auto leading-relaxed font-lato">
          Perform multiple hardware analysis simultaneously. Add up to 5 serial numbers for batch processing.
        </p>
      </header>

      <div className="bg-white/40 backdrop-blur-sm p-6 md:p-10 rounded-[2.5rem] border border-dark/5 shadow-inner mb-12">
        <div className="space-y-2">
          {listaSeries.map((serie, index) => (
            <FilaBusqueda
              key={index}
              index={index}
              value={serie}
              onChange={handleInputChange}
              onOpenDetails={abrirDetalles}
              onDelete={eliminarFila}
              isValid={productosAnalizados[index]?.valido || false}
            />
          ))}
        </div>

        {/* Acciones de Grupo */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={agregarFila}
            disabled={listaSeries.length >= 5}
            className={`w-full sm:w-auto flex items-center justify-center space-x-3 px-8 py-4 rounded-2xl font-bold uppercase tracking-widest transition-all shadow-lg ${
              listaSeries.length < 5
                ? 'bg-dark text-white hover:bg-dark/90 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-dark/10 text-dark/30 cursor-not-allowed shadow-none border border-dark/5'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add Row ({listaSeries.length}/5)</span>
          </button>

          <button
            onClick={resetearTodo}
            className="w-full sm:w-auto flex items-center justify-center space-x-3 px-8 py-4 bg-white border-2 border-dark/10 text-dark/60 rounded-2xl font-bold uppercase tracking-widest hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all active:scale-[0.98]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset All</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        {productosAnalizados.filter(p => p?.valido).map((p, i) => {
          const isRefurb = p.resultadoCompleto?.isRefurbished;
          const isDiscontinued = p.resultadoCompleto?.datosComerciales?.discontinued?.toUpperCase() === 'TRUE';
          
          let containerClasses = "bg-primary/5 border-primary/10";
          let labelClasses = "text-primary/60";
          
          if (isRefurb && isDiscontinued) {
            containerClasses = "bg-gradient-to-r from-red-500/30 to-orange-500/30 border-red-500/40 shadow-sm shadow-red-500/5";
            labelClasses = "text-red-500/60";
          } else if (isDiscontinued) {
            containerClasses = "bg-red-500/10 border-red-500/20 shadow-sm shadow-red-500/5";
            labelClasses = "text-red-500/60";
          } else if (isRefurb) {
            containerClasses = "bg-orange-500/10 border-orange-500/20 shadow-sm shadow-orange-500/5";
            labelClasses = "text-orange-500/60";
          }

          const modelDisplay = (isRefurb) ? `${p.model_na}-FC` : p.model_na;

          return (
            <div 
              key={i} 
              className={`p-3 border rounded-xl animate-in zoom-in-90 transition-all duration-300 ${containerClasses}`}
            >
              <span className={`block text-xs uppercase tracking-widest font-bold mb-1 font-lato ${labelClasses}`}>
                Row #{p.index + 1}
              </span>
              <span className="block text-dark text-md truncate font-fjalla uppercase">
                {modelDisplay}
              </span>
            </div>
          );
        })}
      </div>

      <ModalDetalles 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        resultadoCompleto={itemSeleccionado} 
      />
    </div>
  );
};

export default Buscador;
