'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { WebGLProgramParametersWithUniforms } from 'three';
import { useSneakerStore } from '@/lib/store';
import {
  DEFAULT_COLOR,
  MATERIAL_PRESETS,
  HIDDEN_MESHES,
  MODEL_PATH,
} from '@/lib/modelConfig';

// ---------------------------------------------------------------------------
// Draco decoder path.
//
// drei's useGLTF accepts the decoder path as its second argument. Passing a
// string here makes drei configure its DRACOLoader with our locally-hosted
// decoder (public/draco/) instead of the default gstatic CDN — no network
// dependency, and it works offline. (An `extendLoader` callback does NOT work
// for this: drei sets its own DRACOLoader *after* the callback runs, so any
// DRACOLoader assigned in the callback is overwritten.)
// ---------------------------------------------------------------------------
const DRACO_PATH = '/draco/';

useGLTF.preload(MODEL_PATH, DRACO_PATH);

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TARGET_SIZE = 2;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function collectMeshes(root: THREE.Object3D): THREE.Mesh[] {
  const meshes: THREE.Mesh[] = [];
  root.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      meshes.push(child as THREE.Mesh);
    }
  });
  return meshes;
}

// ---------------------------------------------------------------------------
// Tint shader
//
// The baked texture carries the leather's light/shadow detail; we throw away
// its hue and rebuild the colour from the user's pick, scaled by the texel
// luminance. That keeps the shading and material feel while letting *any*
// colour show cleanly — no dependence on what colour a region happens to be
// painted in the atlas.
// ---------------------------------------------------------------------------
function injectTint(shader: WebGLProgramParametersWithUniforms, tint: THREE.Color) {
  shader.uniforms.uTint = { value: tint };

  shader.fragmentShader = shader.fragmentShader
    .replace('uniform vec3 diffuse;', 'uniform vec3 diffuse;\nuniform vec3 uTint;')
    .replace(
      '#include <map_fragment>',
      [
        '#ifdef USE_MAP',
        '  vec4 texelColor = texture2D( map, vMapUv );',
        '  float lum = clamp(dot(texelColor.rgb, vec3(0.299, 0.587, 0.114)), 0.0, 1.0);',
        '  float shade = mix(0.35, 1.0, clamp(lum / 0.6, 0.0, 1.0));',
        '  texelColor.rgb = uTint * shade;',
        '  diffuseColor *= texelColor;',
        '#endif',
      ].join('\n'),
    );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Sneaker() {
  const { scene } = useGLTF(MODEL_PATH, DRACO_PATH);
  const groupRef = useRef<THREE.Group>(null);

  const color = useSneakerStore((s) => s.color);
  const material = useSneakerStore((s) => s.material);

  // Colour currently shown (mutated in place — the shader uniform references
  // this object) and the target it lerps toward for smooth transitions.
  const displayColor = useRef(new THREE.Color(DEFAULT_COLOR));
  const targetColor = useRef(new THREE.Color(DEFAULT_COLOR));

  const targetRoughness = useRef(MATERIAL_PRESETS.leather.roughness);
  const targetMetalness = useRef(MATERIAL_PRESETS.leather.metalness);

  // Build one tinted material and apply it to every mesh.
  //
  // The three meshes overlap and together form a solid pair (each fills the
  // others' thin spots), so we render them all and give them one shared
  // material — the whole pair then always renders in the same colourway.
  const tintMaterial = useMemo(() => {
    const allMeshes = collectMeshes(scene);
    allMeshes.forEach((mesh) => {
      mesh.visible = !HIDDEN_MESHES.includes(mesh.name);
    });

    const baseMesh = allMeshes.find((m) => m.visible) ?? allMeshes[0];
    const baseMaterial = baseMesh.material as THREE.MeshStandardMaterial;

    const mat = baseMaterial.clone();
    if (mat.map) mat.map = mat.map.clone();
    mat.color.setHex(0xffffff); // base colour white so only the shader tints
    mat.customProgramCacheKey = () => 'sneaker-tint';
    mat.onBeforeCompile = (shader) => {
      injectTint(shader, displayColor.current);
      mat.userData.shader = shader;
    };
    mat.needsUpdate = true;

    allMeshes.forEach((mesh) => {
      if (mesh.visible) mesh.material = mat;
    });

    return mat;
  }, [scene]);

  const normalization = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const longestDim = Math.max(size.x, size.y, size.z);
    const scaleFactor = longestDim > 0 ? TARGET_SIZE / longestDim : 1;
    return { scaleFactor, center };
  }, [scene]);

  useEffect(() => {
    collectMeshes(scene).forEach((mesh) => {
      if (mesh.visible) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [scene]);

  useEffect(() => {
    targetColor.current.set(color);
  }, [color]);

  useEffect(() => {
    targetRoughness.current = MATERIAL_PRESETS[material].roughness;
    targetMetalness.current = MATERIAL_PRESETS[material].metalness;
  }, [material]);

  useFrame((_, delta) => {
    const lerpSpeed = 1 - Math.pow(0.001, delta);

    displayColor.current.lerp(targetColor.current, lerpSpeed);
    tintMaterial.roughness = THREE.MathUtils.lerp(tintMaterial.roughness, targetRoughness.current, lerpSpeed);
    tintMaterial.metalness = THREE.MathUtils.lerp(tintMaterial.metalness, targetMetalness.current, lerpSpeed);

    if (groupRef.current) {
      const t = performance.now() / 1000;
      groupRef.current.position.y += Math.sin(t * 1.2) * 0.0003;
      groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.015;
    }
  });

  const { scaleFactor, center } = normalization;

  return (
    <group ref={groupRef}>
      <group
        scale={[scaleFactor, scaleFactor, scaleFactor]}
        position={[
          -center.x * scaleFactor,
          -center.y * scaleFactor,
          -center.z * scaleFactor,
        ]}
      >
        <primitive object={scene} />
      </group>
    </group>
  );
}
