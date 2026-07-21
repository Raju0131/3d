# SETUP.md — Getting a Sneaker Model Into Sneaker Lab

This guide walks you through finding, downloading, compressing, and wiring up a 3D sneaker model.

---

## 1. Find a Sneaker GLB on Sketchfab

1. Go to [sketchfab.com/search](https://sketchfab.com/search?type=models&q=sneaker).
2. **Search terms** (try in order of quality):
   - `sneaker low poly`
   - `shoe stylized`
   - `nike air max` (many fan-made models exist)
   - `running shoe 3d`
3. **Apply filters**:
   - **Downloadable**: ✅ Yes
   - **License**: Select **CC BY** or **CC BY-SA** (free for any use with attribution). Avoid **CC BY-NC** if you plan commercial use.
   - **File format**: glTF / GLB preferred.
   - **Animated**: ❌ No (we don't need animations).
4. **Look for models with clearly separated parts** — body, sole, and laces as distinct meshes. A model with all geometry merged into one mesh will be very hard to configure.
5. Download the **GLB** format. If only glTF+bin is available, that works too.

> **Recommended model** (free, CC BY 4.0):
> Search `"shoe" downloadable` and sort by "Relevance". Look for any model by a creator with separate mesh groups.

---

## 2. Compress with gltf-transform

Large Sketchfab models can be 20–50 MB. Compress them to ≤5 MB:

```bash
# Install gltf-transform CLI
npm install -g @gltf-transform/cli

# Compress the model (Draco + texture resize)
gltf-transform optimize input.glb sneaker.glb \
  --compress draco \
  --texture-resize 1024
```

If you have very large textures:

```bash
gltf-transform optimize input.glb sneaker.glb \
  --compress draco \
  --texture-resize 512 \
  --texture-compress webp
```

Place the output `sneaker.glb` in `public/sneaker.glb`.

---

## 3. Inspect Mesh Names with gltfjsx

```bash
# Install gltfjsx
npx gltfjsx public/sneaker.glb --types --transform
```

This generates a `.tsx` file listing every mesh. Open it and note every `<mesh name="...">`. You'll see something like:

```tsx
<mesh name="Shoe_Body_Material_0" geometry={...} material={...} />
<mesh name="Shoe_Sole_Material_0" geometry={...} material={...} />
<mesh name="Shoe_Laces_Material_0" geometry={...} material={...} />
```

---

## 4. Update `src/lib/modelConfig.ts`

Open `src/lib/modelConfig.ts` and replace the placeholder mesh names with the real ones:

```ts
export const MODEL_CONFIG: Record<PartId, PartConfig> = {
  body: {
    label: 'Body',
    meshNames: ['Shoe_Body_Material_0'],  // ← your actual name(s)
    defaultColor: '#F5F5F0',
  },
  sole: {
    label: 'Sole',
    meshNames: ['Shoe_Sole_Material_0'],  // ← your actual name(s)
    defaultColor: '#E8E4DF',
  },
  laces: {
    label: 'Laces',
    meshNames: ['Shoe_Laces_Material_0'], // ← your actual name(s)
    defaultColor: '#FFFFFF',
  },
};
```

> **Tip:** Some models split one logical part (e.g., "body") into multiple meshes like `Shoe_Upper_0` and `Shoe_Panels_0`. Put all of them in the same `meshNames` array — they'll all receive the same color.

---

## 5. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You should see your sneaker with the default colors, and the configurator panel on the right.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Model not visible | Check the console for loading errors. Ensure `public/sneaker.glb` exists. |
| Model too big / too small | Add `scale={[S, S, S]}` to `<primitive>` in `Sneaker.tsx`, or scale in Blender before export. |
| Colors not changing | Verify mesh names match exactly (case-sensitive) between `modelConfig.ts` and the GLB. |
| All parts change together | Materials are shared in the GLB — the clone logic should fix this, but verify the mesh names are correctly mapped to different parts. |
