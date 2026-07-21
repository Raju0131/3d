import { create } from 'zustand';
import {
  DEFAULT_COLOR,
  MATERIAL_PRESETS,
  BASE_PRICE,
  type MaterialId,
} from './modelConfig';

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------
interface SneakerState {
  color: string;
  material: MaterialId;
  setColor: (color: string) => void;
  setMaterial: (material: MaterialId) => void;
  reset: () => void;
  totalPrice: () => number;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
export const useSneakerStore = create<SneakerState>()((set, get) => ({
  color: DEFAULT_COLOR,
  material: 'leather',

  setColor: (color) => set({ color }),

  setMaterial: (material) => set({ material }),

  reset: () =>
    set({
      color: DEFAULT_COLOR,
      material: 'leather',
    }),

  totalPrice: () => {
    const { material } = get();
    return BASE_PRICE + MATERIAL_PRESETS[material].priceDelta;
  },
}));
