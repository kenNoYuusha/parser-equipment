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
    <nav className="bg-surface border-b border-border-main sticky top-0 z-100 transition-colors duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img 
            src={theme === 'dark' ? '/parser-equipment/egodark.png' : theme === 'pink' ? '/parser-equipment/egopink.png' : '/parser-equipment/egolight.png'} 
            alt="Logo" 
            className="w-24 object-contain"
          />
          <span className="font-fjalla text-text-main tracking-widest hidden sm:inline">PARCER EQUIPMENT</span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex bg-text-main/5 p-1 rounded-xl border border-border-main">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  theme === t.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-muted hover:text-text-main'
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
