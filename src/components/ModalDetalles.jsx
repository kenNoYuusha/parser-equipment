import { useEffect } from 'react';
import ResultadoCard from './ResultadoCard';


/**
 * Modal flotante para mostrar el detalle completo de un análisis.
 * UX Ajustada: Sin botón X, sin padding interno, cierre por ESC o Click fuera.
 */
const ModalDetalles = ({ isOpen, onClose, resultadoCompleto }) => {
  // Cerrar con la tecla Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Contenedor del Modal - Sin Padding y con overflow-hidden */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-surface rounded-4xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden border border-border-main">
        <ResultadoCard resultado={resultadoCompleto} />
      </div>
    </div>
  );
};

export default ModalDetalles;
