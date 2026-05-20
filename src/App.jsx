import React from 'react';
import Buscador from './components/Buscador';

/**
 * Punto de entrada de la aplicación.
 * Estructura rediseñada con Tailwind CSS.
 */
function App() {
  return (
    <div className="min-h-screen bg-light selection:bg-primary selection:text-white pb-24">
      <main className="container mx-auto px-4 py-12">
        <Buscador />
      </main>
      
      <footer className="fixed bottom-0 left-0 w-full py-2 bg-primary text-dark text-xs font-medium shadow-inner z-50">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center opacity-90">
          <p>&copy; {new Date().getFullYear()} Parcer Equipment - Serial Analysis System</p>
          <p className="text-[10px] uppercase tracking-tighter sm:mt-0 mt-1">
            Powered By: <span className="font-bold">Jorge Luis</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
