import React from 'react';
import { useAppStore } from '../store/useAppStore';

const Navbar = () => {
  const { theme, setTheme } = useAppStore();

  const themes = [
    { id: 'original', label: 'Light', color: 'bg-[#77bc1f]' },
    { id: 'dark', label: 'Dark', color: 'bg-[#3c3936]' },
    { id: 'pink', label: 'Pink', color: 'bg-[#ff85a2]' },
  ];

  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-100">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img 
            src={theme === 'dark' ? '/parser-equipment/egodark.png' : theme === 'pink' ? '/parser-equipment/egopink.png' : '/parser-equipment/egolight.png'} 
            alt="Logo" 
            className="w-24 object-contain"
          />
          <span className="font-fjalla text-dark tracking-widest hidden sm:inline">PARCER EQUIPMENT</span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex bg-dark/5 p-1 rounded-xl border border-dark/10">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  theme === t.id
                    ? 'bg-white text-dark shadow-sm'
                    : 'text-dark/40 hover:text-dark/60'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
