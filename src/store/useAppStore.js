import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cargarDiccionarioModelos, cargarKits } from '../services/fetchModels';

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Theme State
      theme: 'original',
      setTheme: (newTheme) => {
        set({ theme: newTheme });
        document.documentElement.setAttribute('data-theme', newTheme);
      },

      // Data State
      diccionarioModelos: null,
      kits: [],
      cargando: false,
      error: null,

      fetchDatabase: async () => {
        if (get().diccionarioModelos && get().kits.length > 0) return;
        
        set({ cargando: true, error: null });
        try {
          const [modelos, kitsData] = await Promise.all([
            cargarDiccionarioModelos(),
            cargarKits()
          ]);
          set({ diccionarioModelos: modelos, kits: kitsData, cargando: false });
        } catch (err) {
          set({ error: err.message, cargando: false });
        }
      },

      // Analysis State
      listaSeries: [""],
      productosAnalizados: [],
      
      setListaSeries: (lista) => set({ listaSeries: lista }),
      setProductosAnalizados: (productos) => set({ productosAnalizados: productos }),
      
      actualizarProducto: (index, serial, data) => {
        const nuevaLista = [...get().listaSeries];
        nuevaLista[index] = serial;
        
        const nuevosProductos = [...get().productosAnalizados];
        nuevosProductos[index] = data;
        
        set({ 
          listaSeries: nuevaLista,
          productosAnalizados: nuevosProductos 
        });
      },

      eliminarProducto: (index) => {
        const nuevaLista = get().listaSeries.filter((_, i) => i !== index);
        const filtrados = get().productosAnalizados.filter((_, i) => i !== index);
        
        set({ 
          listaSeries: nuevaLista.length ? nuevaLista : [""],
          productosAnalizados: filtrados.map((p, i) => ({ ...p, index: i })) 
        });
      },

      resetProductos: () => set({ 
        listaSeries: [""],
        productosAnalizados: [] 
      }),
    }),
    {
      name: 'parcer-equipment-storage',
      partialize: (state) => ({ 
        theme: state.theme, 
        listaSeries: state.listaSeries,
        productosAnalizados: state.productosAnalizados 
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          document.documentElement.setAttribute('data-theme', state.theme);
        }
      }
    }
  )
);
