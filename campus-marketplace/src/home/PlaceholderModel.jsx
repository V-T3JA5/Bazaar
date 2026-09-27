import { useMemo } from 'react'
import * as THREE from 'three'
import { useTheme } from '../context/ThemeContext.jsx'

// TEMPORARY: stand-in primitives used only to build and test the scroll
// choreography before the real .glb files exist.
//
// To swap in a real model later, replace the `baseGeometry` below with the
// loaded mesh's geometry, e.g.:
//   const { scene } = useGLTF('/models/academic.glb')
//   const meshGeometry = scene.getObjectByProperty('type', 'Mesh').geometry
//   const edges = new THREE.EdgesGeometry(meshGeometry)
// Nothing else in this file or in CategoryLayer needs to change — the
// group ref, rotation tween, and scroll timeline all target the <group>,
// not this geometry.
const SHAPES = {
  box: () => new THREE.BoxGeometry(1.5, 1.5, 1.5),
  icosahedron: () => new THREE.IcosahedronGeometry(1.3, 0),
  torus: () => new THREE.TorusGeometry(1.05, 0.42, 8, 24),
}

export default function PlaceholderModel({ shape, groupRef }) {
  const { theme } = useTheme()
  const lineColor = theme === 'dark' ? '#f5f7fa' : '#1a2a4a'

  const edges = useMemo(() => {
    const baseGeometry = (SHAPES[shape] || SHAPES.box)()
    return new THREE.EdgesGeometry(baseGeometry)
  }, [shape])

  return (
    <group ref={groupRef}>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={lineColor} />
      </lineSegments>
    </group>
  )
}
