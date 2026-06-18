import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Buscador from './components/Buscador';
import Navbar from './components/Navbar';

/**
 * Punto de entrada de la aplicación con navegación y temas.
 */
function App() {
  return (
    <div className="min-h-screen bg-bg-app selection:bg-primary selection:text-white pb-24 transition-colors duration-300 relative">
      {/* Patrón de Fondo Decorativo */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-tool-pattern" aria-hidden="true" />
      
      <div className="relative z-10">
        <Navbar />
        
        <main className="container mx-auto px-4 py-12">
          <Routes>
            <Route path="/" element={<Buscador />} />
          </Routes>
        </main>
      </div>
      
      <footer className="fixed bottom-0 left-0 w-full py-2 bg-primary text-white text-xs font-medium shadow-inner z-50">
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
