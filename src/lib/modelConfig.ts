/**
 * modelConfig — mesh names and product metadata for the sneaker.
 *
 * The model has three meshes (node names `Object_4`, `Object_5`, `Object_6`).
 * They overlap and together form a solid-looking pair — each fills the others'
 * thin spots, so ALL of them must render. (Hiding any of them exposes gaps in
 * the remaining geometry.) We render every mesh and tint them all with one
 * colourway via a luminance-preserving recolour in the shader, so the whole
 * pair always matches and any colour reads cleanly regardless of the baked
 * texture.
 */

// ---------------------------------------------------------------------------
// Mesh assignments
// ---------------------------------------------------------------------------

/** No meshes are hidden — all three overlap to form a solid pair. */
export const HIDDEN_MESHES: string[] = [];

/** Default colourway (matches the "Original" swatch). */
export const DEFAULT_COLOR = '#E8E2D9';

// ---------------------------------------------------------------------------
// Color palette
// ---------------------------------------------------------------------------
export interface ColorSwatch {
  name: string;
  hex: string;
}

export const COLOR_PALETTE: ColorSwatch[] = [
  { name: 'Original', hex: '#E8E2D9' },
  { name: 'Midnight', hex: '#1A1A2E' },
  { name: 'Espresso', hex: '#3C2415' },
  { name: 'Sage',     hex: '#7D8E72' },
  { name: 'Terracotta', hex: '#C2703E' },
  { name: 'Navy',     hex: '#0A192F' },
];

// ---------------------------------------------------------------------------
// Material presets
// ---------------------------------------------------------------------------
export const MATERIAL_IDS = ['leather', 'suede', 'canvas'] as const;
export type MaterialId = (typeof MATERIAL_IDS)[number];

export interface MaterialPreset {
  label: string;
  roughness: number;
  metalness: number;
  priceDelta: number;
}

export const MATERIAL_PRESETS: Record<MaterialId, MaterialPreset> = {
  leather: {
    label: 'Leather',
    roughness: 0.35,
    metalness: 0.15,
    priceDelta: 15,
  },
  suede: {
    label: 'Suede',
    roughness: 0.85,
    metalness: 0.0,
    priceDelta: 20,
  },
  canvas: {
    label: 'Canvas',
    roughness: 0.6,
    metalness: 0.0,
    priceDelta: 0,
  },
};

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------
export const BASE_PRICE = 120;

// ---------------------------------------------------------------------------
// Model path (relative to /public)
// ---------------------------------------------------------------------------
export const MODEL_PATH = '/sneaker.glb';
