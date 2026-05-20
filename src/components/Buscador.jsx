import React, { useState, useMemo } from 'react';
import { useModels } from '../hooks/useModels';
import { findMatchingKit } from '../services/kitMatcher';
import FilaBusqueda from './FilaBusqueda';
import ModalDetalles from './ModalDetalles';

/**
 * Componente Buscador: Refactorizado para procesamiento por lotes (Batch) y emparejamiento de Kits.
 */
const Buscador = () => {
  const { 
    cargando, 
    error, 
    productosAnalizados,
    kits,
    actualizarProductoAnalizado, 
    eliminarProductoAnalizado,
    resetearProductosAnalizados 
  } = useModels();
  
  const [listaSeries, setListaSeries] = useState([""]);
  const [modalOpen, setModalOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);

  /**
   * Lógica de emparejamiento de Kits (Memorizada)
   * Se dispara automáticamente cuando cambia la lista de productos analizados o la DB de kits.
   */
  const masterCode = useMemo(() => {
    return findMatchingKit(productosAnalizados, kits);
  }, [productosAnalizados, kits]);

  const handleInputChange = (index, valor) => {
    const nuevaLista = [...listaSeries];
    nuevaLista[index] = valor;
    setListaSeries(nuevaLista);
    actualizarProductoAnalizado(index, valor);
  };

  const agregarFila = () => {
    if (listaSeries.length < 10) {
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
    // Si no hay nada que resetear, no hacemos nada
    if (listaSeries.length === 1 && listaSeries[0] === "") return;
    setShowResetConfirm(true);
  };

  const confirmarReset = () => {
    setListaSeries([""]);
    resetearProductosAnalizados();
    setShowResetConfirm(false);
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
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 font-lato">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-dark/70 font-medium">Synchronizing Commercial Database...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <header className="text-center mb-10 animate-in fade-in duration-700">
        <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full mb-4 uppercase tracking-[0.2em] border border-primary/20">
          Batch Processing System
        </div>
        <h1 className="text-3xl md:text-4xl text-dark mb-4 uppercase tracking-widest font-fjalla">
          Serial Verification
        </h1>
        <p className="text-dark/50 text-sm md:text-base max-w-3xl mx-auto leading-relaxed font-lato">
          Simultaneous multi-hardware analysis for batch processing up to 10 units.
        </p>
      </header>

      {/* Alerta de Master Code (Posicionada después del subtítulo) */}
      {masterCode && (
        <div className="mb-6 animate-in slide-in-from-top duration-500">
          <div className="bg-primary/10 border-2 border-primary/30 p-4 rounded-2xl flex items-center justify-center space-x-4 shadow-lg shadow-primary/5">
            <div className="bg-primary text-white p-2 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div className="text-center">
              <span className="block text-[10px] uppercase tracking-[0.2em] text-primary/60 font-bold">Matching Kit Found</span>
              <h2 className="text-2xl font-fjalla text-dark uppercase tracking-wider">
                Master Code: <span className="text-primary">{masterCode}</span>
              </h2>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/40 backdrop-blur-sm p-6 md:p-8 rounded-[2.5rem] border border-dark/5 shadow-inner mb-8">
        {/* Cabecera de Acciones Centrada */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8 pb-6 border-b border-dark/5">
          <button
            onClick={agregarFila}
            disabled={listaSeries.length >= 10}
            className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-md ${
              listaSeries.length < 10
                ? 'bg-dark text-white hover:bg-dark/90 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-dark/10 text-dark/30 cursor-not-allowed shadow-none border border-dark/5'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add Serial ({listaSeries.length}/10)</span>
          </button>

          <button
            onClick={resetearTodo}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-white border border-dark/10 text-dark/60 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all active:scale-[0.98] shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset All</span>
          </button>
        </div>

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
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        {productosAnalizados.filter(p => p?.valido).map((p, i) => {
          const isRefurb = p.resultadoCompleto?.isRefurbished;
          const isDiscontinued = p.resultadoCompleto?.datosComerciales?.discontinued?.toUpperCase() === 'TRUE';
          
          let containerClasses = "bg-primary/5 border-primary/10";
          let labelClasses = "text-primary/60";
          
          if (isRefurb && isDiscontinued) {
            containerClasses = "bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20 shadow-sm shadow-red-500/5";
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
              <span className={`block text-[8px] uppercase tracking-widest font-bold mb-1 font-lato ${labelClasses}`}>
                Row #{p.index + 1}
              </span>
              <span className="block text-dark text-sm truncate font-fjalla uppercase font-normal">
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

      {/* Modal de Confirmación de Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={() => setShowResetConfirm(false)}></div>
          <div className="relative bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-fjalla text-dark uppercase mb-2">Are you sure?</h3>
            <p className="text-dark/50 text-sm font-lato mb-8">
              This will clear all inputs and analysis results. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 px-4 bg-dark/5 text-dark/60 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-dark/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmarReset}
                className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Buscador;
