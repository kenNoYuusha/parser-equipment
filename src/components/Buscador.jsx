import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { findMatchingKit } from '../services/kitMatcher';
import { enriquecerNumeroSerie } from '../services/fetchModels';
import FilaBusqueda from './FilaBusqueda';
import ModalDetalles from './ModalDetalles';

const Buscador = () => {
  const { 
    cargando, 
    listaSeries,
    productosAnalizados,
    diccionarioModelos,
    kits,
    fetchDatabase,
    setListaSeries,
    actualizarProducto, 
    eliminarProducto,
    resetProductos 
  } = useAppStore();

  
  const [modalOpen, setModalOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);

  // Inicializar base de datos
  useEffect(() => {
    fetchDatabase();
  }, [fetchDatabase]);

  // Lógica de emparejamiento de Kits (El compilador de React se encarga de memoizar esto)
  const matchingKit = findMatchingKit(productosAnalizados, kits);

  const handleInputChange = (index, valor) => {
    if (!valor.trim()) {
      actualizarProducto(index, valor, { index, valido: false });
      return;
    }

    const datos = enriquecerNumeroSerie(valor, diccionarioModelos);

    if (datos.valido && datos.datosComerciales) {
      actualizarProducto(index, valor, {
        index,
        model_na: datos.datosComerciales.model_na,
        correlativo: datos.correlativo,
        valido: true,
        resultadoCompleto: datos
      });
    } else {
      actualizarProducto(index, valor, { index, valido: false });
    }
  };

  const agregarFila = () => {
    if (listaSeries.length < 10) {
      setListaSeries([...listaSeries, ""]);
    }
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
        <p className="text-text-muted font-medium">Synchronizing Databases...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <header className="text-center mb-10 animate-in fade-in duration-700">
        <div className="inline-block px-4 py-1.5 bg-primary/15 text-primary text-[10px] font-bold rounded-full mb-4 uppercase tracking-[0.2em] border border-primary/20 transition-colors">
          Batch Processing System
        </div>
        <h1 className="text-3xl md:text-4xl text-text-main mb-4 uppercase tracking-widest font-fjalla transition-colors">
          Serial Verification
        </h1>
      </header>

      {/* Alerta de Kit Encontrado */}
      {matchingKit && (
        <div className="mb-8 animate-in slide-in-from-top duration-500">
          <div className="bg-primary/10 border-2 border-primary/30 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-primary/5 transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-primary text-white p-3 rounded-2xl shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-[0.2em] text-primary font-bold">Matching Kit Found</span>
                <h2 className="text-2xl font-fjalla text-text-main uppercase tracking-wider">
                  Model: <span className="text-primary">{matchingKit.model_id}</span>
                </h2>
              </div>
            </div>
            {matchingKit.product_description && (
              <div className="text-right hidden md:block">
                <p className="text-text-muted text-[10px] uppercase font-bold tracking-widest">Description</p>
                <p className="text-text-main font-medium text-sm">{matchingKit.product_description}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-surface/50 p-6 md:p-8 rounded-[2.5rem] border border-border-main shadow-inner mb-8 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 pb-6 border-b border-border-main">
          <div className="text-left">
            <h3 className="text-sm text-text-main/60 font-bold uppercase tracking-wider">Input Serials</h3>
            <p className="text-[10px] text-text-muted uppercase tracking-widest">Max 10 units per batch</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={agregarFila}
              disabled={listaSeries.length >= 10}
              className="flex items-center space-x-2 px-4 py-2 bg-text-main text-surface rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all hover:opacity-90 disabled:opacity-20 shadow-md"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add</span>
            </button>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-surface border border-border-main text-text-muted rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-red-500/10 hover:text-red-500 transition-all"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="space-y-1">
          {listaSeries.map((serie, index) => (
            <FilaBusqueda
              key={index}
              index={index}
              value={serie}
              onChange={handleInputChange}
              onOpenDetails={abrirDetalles}
              onDelete={eliminarProducto}
              productoAnalizado={productosAnalizados[index]}
            />
          ))}
        </div>
      </div>

      <ModalDetalles 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        resultadoCompleto={itemSeleccionado} 
      />

      {/* Modal de Confirmación de Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowResetConfirm(false)}></div>
          <div className="relative bg-surface p-8 rounded-4xl shadow-2xl max-w-sm w-full text-center animate-in zoom-in-95 duration-300 border border-border-main">
            <h3 className="text-xl font-fjalla text-text-main uppercase mb-2">Clear Analysis?</h3>
            <p className="text-text-muted text-sm font-lato mb-8">This will reset all inputs and results.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-3 px-4 bg-text-main/5 text-text-muted rounded-xl font-bold uppercase tracking-widest text-[10px]">Cancel</button>
              <button onClick={() => { resetProductos(); setShowResetConfirm(false); }} className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20">Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Buscador;
