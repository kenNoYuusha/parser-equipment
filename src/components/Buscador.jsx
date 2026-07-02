import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { resolverAsignacionMultiKits } from '../services/kitMatcher';
import { enriquecerNumeroSerie } from '../services/fetchModels';
import FilaBusqueda from './FilaBusqueda';
import ModalDetalles from './ModalDetalles';
import ModalDetallesKit from './ModalDetallesKit';

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

  // States for Kit Details Modal
  const [kitSeleccionado, setKitSeleccionado] = useState(null);
  const [modalKitOpen, setModalKitOpen] = useState(false);

  // State for Copy Toast Notification
  const [mostrarCopiadoToast, setMostrarCopiadoToast] = useState(false);

  // Inicializar base de datos
  useEffect(() => {
    fetchDatabase();
  }, [fetchDatabase]);

  // Lógica de emparejamiento de Kits Multi-Kit
  const asignacionesKits = resolverAsignacionMultiKits(productosAnalizados, kits);

  // Agrupamos las filas por su kit asignado o las dejamos sueltas
  const gruposRenderizado = [];
  const indicesProcesados = new Set();

  for (let i = 0; i < listaSeries.length; i++) {
    if (indicesProcesados.has(i)) continue;

    const asignacion = asignacionesKits[i];

    if (asignacion && asignacion.herramientaIndex !== undefined) {
      const herramientaIdx = asignacion.herramientaIndex;
      const indicesDelKit = [];

      // Buscamos todas las filas asociadas a esta misma herramienta iniciadora
      for (let j = 0; j < listaSeries.length; j++) {
        if (asignacionesKits[j]?.herramientaIndex === herramientaIdx) {
          indicesDelKit.push(j);
          indicesProcesados.add(j);
        }
      }

      indicesDelKit.sort((a, b) => a - b);

      gruposRenderizado.push({
        tipo: 'kit',
        herramientaIndex: herramientaIdx,
        indices: indicesDelKit,
        kitInfo: asignacion
      });
    } else {
      gruposRenderizado.push({
        tipo: 'suelto',
        index: i
      });
      indicesProcesados.add(i);
    }
  }

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
    if (listaSeries.length < 30) {
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

  const abrirDetallesKit = (kit) => {
    if (kit) {
      setKitSeleccionado(kit);
      setModalKitOpen(true);
    }
  };

  // Clipboard Copier Function
  const copiarResultados = () => {
    const asignaciones = resolverAsignacionMultiKits(productosAnalizados, kits);
    
    // 1. Group components by tool index
    const kitsAgrupados = {};
    const indicesKitsProcesados = new Set();
    
    for (let i = 0; i < listaSeries.length; i++) {
      const asig = asignaciones[i];
      if (asig && asig.herramientaIndex !== undefined) {
        const hIdx = asig.herramientaIndex;
        if (!kitsAgrupados[hIdx]) {
          kitsAgrupados[hIdx] = {
            kitAsociado: asig.kitAsociado,
            componentes: []
          };
        }
        kitsAgrupados[hIdx].componentes.push(i);
        indicesKitsProcesados.add(i);
      }
    }
    
    // 2. Group baretools (validated but not assigned to any kit)
    const baretools = [];
    for (let i = 0; i < listaSeries.length; i++) {
      if (productosAnalizados[i]?.valido && !indicesKitsProcesados.has(i)) {
        baretools.push(i);
      }
    }
    
    // 3. Format plain text output
    let textoCopiar = "";
    const bloquesKits = [];
    
    for (const [hIdx, data] of Object.entries(kitsAgrupados)) {
      data.componentes.sort((a, b) => a - b);
      
      let bloque = `Kit: ${data.kitAsociado.model_id}\n`;
      const lineasComp = data.componentes.map(idx => {
        const serial = listaSeries[idx] || "";
        const modelo = productosAnalizados[idx]?.model_na || "";
        return `${serial.padEnd(25, ' ')}${modelo}`;
      });
      bloque += lineasComp.join('\n');
      bloquesKits.push(bloque);
    }
    
    if (bloquesKits.length > 0) {
      textoCopiar += bloquesKits.join('\n\n'); // One empty line between kits
    }
    
    if (baretools.length > 0) {
      if (textoCopiar.length > 0) {
        textoCopiar += '\n\n'; // One empty line separator
      }
      textoCopiar += "Baretools:\n";
      const lineasBare = baretools.map(idx => {
        const serial = listaSeries[idx] || "";
        const modelo = productosAnalizados[idx]?.model_na || "";
        return `${serial.padEnd(25, ' ')}${modelo}`;
      });
      textoCopiar += lineasBare.join('\n');
    }
    
    // 4. Write text to Clipboard
    navigator.clipboard.writeText(textoCopiar)
      .then(() => {
        setMostrarCopiadoToast(true);
        setTimeout(() => setMostrarCopiadoToast(false), 1500);
      })
      .catch(err => {
        console.error("Failed to copy results to clipboard: ", err);
      });
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

      <div className="bg-surface/50 p-6 md:p-8 rounded-[2.5rem] border border-border-main shadow-inner mb-8 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 pb-6 border-b border-border-main">
          <div className="text-left">
            <h3 className="text-sm text-text-main/60 font-bold uppercase tracking-wider">Input Serials</h3>
            <p className="text-[10px] text-text-muted uppercase tracking-widest">Max 30 units per batch</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={agregarFila}
              disabled={listaSeries.length >= 30}
              className="flex items-center space-x-2 px-4 py-2 bg-text-main text-surface rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all hover:opacity-90 disabled:opacity-20 shadow-md cursor-pointer"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add</span>
            </button>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-surface border border-border-main text-text-muted rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-red-500/10 hover:text-red-500 transition-all cursor-pointer"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Reset</span>
            </button>

            {/* Copy Button (Positioned at the far right) */}
            <button
              onClick={copiarResultados}
              disabled={!productosAnalizados.some(p => p?.valido)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-md ${
                productosAnalizados.some(p => p?.valido)
                  ? mostrarCopiadoToast
                    ? 'bg-green-500 text-white hover:opacity-90'
                    : 'bg-surface border border-border-main text-text-main hover:bg-text-main/5 cursor-pointer'
                  : 'bg-surface border border-border-main text-text-muted opacity-30 cursor-not-allowed shadow-none'
              }`}
            >
              {mostrarCopiadoToast ? (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Contenedor de Filas con tamaño mínimo para asegurar la alineación de columnas */}
        <div className="space-y-3 min-w-[760px]">
          {gruposRenderizado.map((grupo, gIdx) => {
            if (grupo.tipo === 'kit') {
              const borderTheme = grupo.kitInfo.matchCompleto 
                ? 'border-primary/40 shadow-lg shadow-primary/5 bg-primary/[0.02]' 
                : 'border-primary/20 shadow shadow-primary/[0.02] bg-primary/[0.01]';

              return (
                <div 
                  key={`kit-group-${grupo.herramientaIndex}`}
                  className={`p-4 rounded-3xl border transition-all duration-300 flex flex-row items-stretch gap-2 ${borderTheme}`}
                >
                  {/* Columna Izquierda: Filas de búsqueda apiladas con ancho fijo compacto */}
                  <div className="flex-none w-[468px] flex flex-col gap-3 justify-center">
                    {grupo.indices.map(idx => (
                      <FilaBusqueda
                        key={idx}
                        index={idx}
                        value={listaSeries[idx]}
                        onChange={handleInputChange}
                        onOpenDetails={abrirDetalles}
                        onDelete={eliminarProducto}
                        productoAnalizado={productosAnalizados[idx]}
                      />
                    ))}
                  </div>

                  {/* Columna Derecha: Etiqueta del kit combinada que se expande hacia la izquierda */}
                  <div className="flex-grow flex items-center justify-center border-l border-border-main pl-2">
                    {grupo.kitInfo.matchCompleto ? (
                      /* Kit completo: tarjeta única al 100% clickeable completa */
                      <div 
                        onClick={() => abrirDetallesKit(grupo.kitInfo.kitAsociado)}
                        className="w-full py-4 px-3 rounded-2xl border bg-primary text-white border-primary shadow-lg shadow-primary/25 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-300 select-none hover:bg-primary/95 active:scale-98 animate-in fade-in"
                      >
                        <svg className="w-5 h-5 flex-none text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span className="text-[8px] uppercase tracking-[0.2em] font-bold opacity-85 text-center">
                          Kit Complete
                        </span>
                        <span className="text-[14px] font-fjalla uppercase tracking-wider text-center font-bold break-all leading-normal mt-1">
                          {grupo.kitInfo.kitAsociado.model_id}
                        </span>
                      </div>
                    ) : (
                      /* Kit incompleto: lista de candidatos viables al 50% clickeables completos */
                      <div className="w-full flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
                        {grupo.kitInfo.candidatos.slice(0, 4).map((cand) => (
                          <div 
                            key={cand.model_id}
                            onClick={() => abrirDetallesKit(cand)}
                            className="w-full py-2.5 px-3 rounded-xl border bg-primary/5 border-primary/20 text-primary opacity-50 hover:opacity-100 hover:bg-primary/10 transition-all flex items-center justify-between gap-2 cursor-pointer select-none"
                          >
                            <span className="text-[11px] font-fjalla uppercase tracking-wider font-bold truncate leading-normal py-0.5">
                              {cand.model_id}
                            </span>
                            <svg 
                              className="w-4 h-4 flex-none text-primary" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        ))}
                        {grupo.kitInfo.candidatos.length > 4 && (
                          <div className="text-[8px] text-text-muted text-center uppercase tracking-widest font-bold pt-1">
                            + {grupo.kitInfo.candidatos.length - 4} options
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            } else {
              // Fila suelta
              return (
                <div 
                  key={`suelto-group-${grupo.index}`}
                  className="p-4 rounded-3xl border border-transparent flex flex-row items-stretch gap-2"
                >
                  <div className="flex-none w-[468px] flex flex-col gap-3 justify-center">
                    <FilaBusqueda
                      key={grupo.index}
                      index={grupo.index}
                      value={listaSeries[grupo.index]}
                      onChange={handleInputChange}
                      onOpenDetails={abrirDetalles}
                      onDelete={eliminarProducto}
                      productoAnalizado={productosAnalizados[grupo.index]}
                    />
                  </div>
                  {/* Columna derecha vacía que se expande para mantener la cuadrícula perfectamente alineada */}
                  <div className="flex-grow border-l border-transparent pl-2"></div>
                </div>
              );
            }
          })}
        </div>
      </div>

      <ModalDetalles 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        resultadoCompleto={itemSeleccionado} 
      />

      <ModalDetallesKit
        isOpen={modalKitOpen}
        onClose={() => setModalKitOpen(false)}
        kit={kitSeleccionado}
        productosAnalizados={productosAnalizados}
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
