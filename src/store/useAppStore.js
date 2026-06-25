import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cargarDiccionarioModelos, cargarKits } from '../services/fetchModels';
import { preprocessKits } from '../services/kitMatcher';

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
        const hasCachedData = get().diccionarioModelos && get().kits.length > 0;
        
        // Solo mostramos cargando si NO tenemos datos locales en caché
        if (!hasCachedData) {
          set({ cargando: true, error: null });
        }
        
        try {
          const [modelos, kitsDataRaw] = await Promise.all([
            cargarDiccionarioModelos(),
            cargarKits()
          ]);
          
          // Preprocesar los kits una sola vez en la descarga para optimizar el kitMatcher
          const kitsData = preprocessKits(kitsDataRaw);
          
          set({ 
            diccionarioModelos: modelos, 
            kits: kitsData, 
            cargando: false,
            error: null 
          });
        } catch (err) {
          // Si falló y no teníamos caché, mostramos el error. Si teníamos caché, fallamos silenciosamente
          if (!hasCachedData) {
            set({ error: err.message, cargando: false });
          } else {
            console.warn("Background synchronization of databases failed. Using cached data.", err);
          }
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
        productosAnalizados: state.productosAnalizados,
        diccionarioModelos: state.diccionarioModelos,
        kits: state.kits
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          document.documentElement.setAttribute('data-theme', state.theme);
        }
      }
    }
  )
);

