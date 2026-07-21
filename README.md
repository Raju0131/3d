# Sneaker Lab

A production-quality 3D sneaker configurator built with Next.js, React Three Fiber, and Zustand — letting users customize colors, materials, and pricing in real time with smooth interpolated transitions. Designed as a portfolio-grade product page that mirrors the polish and interactivity of a modern direct-to-consumer brand.

---

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Three.js** via React Three Fiber + Drei
- **Zustand** for state management
- **Tailwind CSS** + custom design tokens

## Features

- 🎨 Colourway picker that recolours the whole shoe in real time, with smooth colour lerping and a luminance-preserving tint shader
- 🧵 Material selector (leather, suede, canvas) with live roughness/metalness changes
- 💰 Dynamic pricing with animated transitions
- 📸 One-click PNG screenshot export
- 📱 Responsive: desktop panel + mobile draggable bottom sheet
- ♿ Keyboard-accessible swatches and controls with visible focus rings
- 🔄 Auto-rotating camera that pauses on interaction
- ⚡ Loading screen with progress bar and smooth fade-out
- 🛒 Order summary modal

## Getting Started

```bash
npm install
# Place your sneaker.glb in public/ — see SETUP.md for instructions
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## License

MIT
