import React from 'react';
import Buscador from './components/Buscador';

/**
 * Punto de entrada de la aplicación.
 * Estructura rediseñada con Tailwind CSS.
 */
function App() {
  return (
    <div className="min-h-screen bg-light selection:bg-primary selection:text-white">
      <main className="container mx-auto px-4 py-12">
        <Buscador />
      </main>
      
      <footer className="mt-auto py-8 text-center text-dark/60 border-t border-dark/5 text-sm">
        &copy; {new Date().getFullYear()} Parcer Equipment - Sistema de Análisis de Seriales
      </footer>
    </div>
  );
}

export default App;
