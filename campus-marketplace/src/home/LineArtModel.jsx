import { Suspense, useEffect, useLayoutEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Scene graph, outermost to innermost — each level has exactly one job so
// the animation code never has two tweens fighting over the same property:
//
//   outerRef  → position + scale + an entry/exit spin flourish   (GSAP, on step change)
//   tilt      → fixed viewing elevation (both supplied models are flat slabs, so
//               we look down on them instead of edge-on)
//   spinRef   → the slow continuous turntable rotation           (GSAP, infinite)
//   base      → per-model orientation fix (e.g. lay a ring flat)
//   parts     → invisible depth occluder + edge lines
//
// Context (theme) is passed in as a `color` prop rather than read here, so
// nothing in this file depends on React context crossing into the Canvas.

const SHAPES = {
  torus: () => new THREE.TorusGeometry(0.72, 0.28, 10, 32),
  box: () => new THREE.BoxGeometry(1, 1, 1),
  icosahedron: () => new THREE.IcosahedronGeometry(1, 0),
}

// Centre the geometries and scale them so everything fits inside a sphere
// of radius 1. Every model — a flat chip, a book, a ring — then has the same
// rotation-safe footprint, and the camera only ever has to fit one thing.
function normalizeToUnitSphere(geoms) {
  const box = new THREE.Box3()
  geoms.forEach((g) => {
    g.computeBoundingBox()
    box.union(g.boundingBox)
  })
  const c = box.getCenter(new THREE.Vector3())
  geoms.forEach((g) => g.translate(-c.x, -c.y, -c.z))

  let r = 0
  const v = new THREE.Vector3()
  geoms.forEach((g) => {
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i)
      r = Math.max(r, v.length())
    }
  })
  const k = r > 0 ? 1 / r : 1
  geoms.forEach((g) => g.scale(k, k, k))
  return geoms
}

function Parts({ geoms, edgeAngle, color }) {
  const edges = useMemo(() => geoms.map((g) => new THREE.EdgesGeometry(g, edgeAngle)), [geoms, edgeAngle])

  useEffect(
    () => () => {
      edges.forEach((e) => e.dispose())
      geoms.forEach((g) => g.dispose())
    },
    [edges, geoms],
  )

  return (
    <>
      {geoms.map((g, i) => (
        <group key={i}>
          {/* Invisible occluder: writes depth, draws no colour. Edges on the
              far side of the shape fail the depth test against it, so only
              the edges facing you show — a line drawing, not an x-ray.
              DoubleSide matters: the book is stored with negative scale on all
              three axes, which flips triangle winding, and a one-sided
              occluder would then hide the *near* faces instead of the far ones. */}
          <mesh geometry={g} renderOrder={0}>
            <meshBasicMaterial
              colorWrite={false}
              side={THREE.DoubleSide}
              polygonOffset
              polygonOffsetFactor={1}
              polygonOffsetUnits={1}
            />
          </mesh>
          <lineSegments geometry={edges[i]} renderOrder={1}>
            <lineBasicMaterial color={color} toneMapped={false} />
          </lineSegments>
        </group>
      ))}
    </>
  )
}

function GltfParts({ url, edgeAngle, color }) {
  const { scene } = useGLTF(url)
  const geoms = useMemo(() => {
    scene.updateMatrixWorld(true)
    const list = []
    scene.traverse((o) => {
      if (o.isMesh && o.geometry) {
        // bake each node's transform into a private copy of its geometry,
        // leaving the cached scene untouched
        const g = o.geometry.clone()
        g.applyMatrix4(o.matrixWorld)
        list.push(g)
      }
    })
    return normalizeToUnitSphere(list)
  }, [scene])
  return <Parts geoms={geoms} edgeAngle={edgeAngle} color={color} />
}

function ShapeParts({ shape, edgeAngle, color }) {
  const geoms = useMemo(() => normalizeToUnitSphere([(SHAPES[shape] || SHAPES.box)()]), [shape])
  return <Parts geoms={geoms} edgeAngle={edgeAngle} color={color} />
}

// One invisible sphere, slightly larger than the unit sphere every model is
// normalized into, used as the SOLE pointer hit-target. Multi-mesh GLBs (the
// book has several page meshes) would otherwise fire pointerOver/pointerOut
// every time the cursor crosses a seam between two sub-meshes, which reads
// as flicker. A single enclosing hit-target has no seams.
// depthWrite is off so it can never affect the hidden-line depth test, and
// it draws nothing (opacity 0) — Three.js still raycasts against it since
// raycasting only skips objects with visible=false, not transparent ones.
function HitTarget({ onHoverEnter, onHoverMove, onHoverLeave }) {
  return (
    <mesh
      onPointerOver={onHoverEnter}
      onPointerMove={onHoverMove}
      onPointerOut={onHoverLeave}
      renderOrder={-1}
    >
      <sphereGeometry args={[1.2, 12, 12]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}

// Place the camera so the unit sphere fills `fill` of whichever canvas
// dimension is tighter, then report how wide the view is so the animation
// code can park the model just past the edge on its own side.
function FitCamera({ boundsRef, fill }) {
  const { camera, size } = useThree()
  useLayoutEffect(() => {
    if (!size.width || !size.height) return
    const aspect = size.width / size.height
    const fovV = (camera.fov * Math.PI) / 180
    const fovH = 2 * Math.atan(Math.tan(fovV / 2) * aspect)
    const dist = 1 / Math.sin((Math.min(fovV, fovH) / 2) * fill)
    camera.position.set(0, 0, dist)
    camera.near = dist * 0.2
    camera.far = dist * 4
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    boundsRef.current.halfWidth = Math.tan(fovH / 2) * dist
  }, [camera, size, fill, boundsRef])
  return null
}

export default function LineArtModel({
  url,
  shape,
  color,
  edgeAngle = 20,
  tilt = 0.9,
  baseRotation = [0, 0, 0],
  fill = 0.8,
  outerRef,
  spinRef,
  boundsRef,
  onHoverEnter,
  onHoverMove,
  onHoverLeave,
}) {
  return (
    <>
      <FitCamera boundsRef={boundsRef} fill={fill} />
      <group ref={outerRef}>
        <group rotation={[tilt, 0, 0]}>
          <HitTarget onHoverEnter={onHoverEnter} onHoverMove={onHoverMove} onHoverLeave={onHoverLeave} />
          <group ref={spinRef}>
            <group rotation={baseRotation}>
              <Suspense fallback={null}>
                {url ? (
                  <GltfParts url={url} edgeAngle={edgeAngle} color={color} />
                ) : (
                  <ShapeParts shape={shape} edgeAngle={edgeAngle} color={color} />
                )}
              </Suspense>
            </group>
          </group>
        </group>
      </group>
    </>
  )
}
