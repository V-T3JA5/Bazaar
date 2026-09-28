import { useMemo } from 'react'
import * as THREE from 'three'
import { useTheme } from '../context/ThemeContext.jsx'

// TEMPORARY: stand-in primitives used only to build and test the scroll
// choreography before the real .glb files exist.
//
// To swap in a real model later, replace `baseGeometry` below with the
// loaded mesh's geometry, e.g.:
//   const { scene } = useGLTF('/models/academic.glb')
//   const baseGeometry = scene.getObjectByProperty('type', 'Mesh').geometry
// The occluder + edges + render-order setup below needs no other changes —
// it works on any solid, closed geometry. If your Blender export has
// multiple separate meshes, merge them into one BufferGeometry first (or
// add one occluder + one edges pair per sub-mesh) so hidden-line removal
// sees the whole object as one solid. Keep the export low-poly (a few
// hundred triangles, not tens of thousands) — this is a line-art render,
// extra geometric detail just costs frame time without being visible.
const SHAPES = {
  box: () => new THREE.BoxGeometry(1.7, 1.7, 1.7),
  icosahedron: () => new THREE.IcosahedronGeometry(1.5, 0),
  torus: () => new THREE.TorusGeometry(1.2, 0.48, 8, 24),
}

export default function PlaceholderModel({ shape, groupRef }) {
  const { theme } = useTheme()
  const lineColor = theme === 'dark' ? '#f5f7fa' : '#1a2a4a'

  const baseGeometry = useMemo(() => (SHAPES[shape] || SHAPES.box)(), [shape])
  const edgesGeometry = useMemo(() => new THREE.EdgesGeometry(baseGeometry), [baseGeometry])

  return (
    <group ref={groupRef}>
      {/* Invisible occluder: writes depth but no color. This is what makes
          it a proper line drawing instead of an x-ray — edges on the far
          side of the shape fail the depth test against this solid and
          don't render, while edges on the near side pass and show through. */}
      <mesh geometry={baseGeometry} renderOrder={0}>
        <meshBasicMaterial
          colorWrite={false}
          polygonOffset
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
        />
      </mesh>
      <lineSegments geometry={edgesGeometry} renderOrder={1}>
        <lineBasicMaterial color={lineColor} />
      </lineSegments>
    </group>
  )
}
