// The whole home experience is one linear sequence of discrete steps:
//   0 → hero ("Bazaar")
//   1 → category 0, title only   ("entering")
//   2 → category 0, title + copy ("reading")
//   3 → category 1, title only
//   4 → category 1, title + copy
//   5 → category 2, title only
//   6 → category 2, title + copy
//   7 → closing (about the creator / discover products)
// One wheel/swipe/key gesture moves exactly one step, in either direction —
// see HomeExperience for why.

export const CATEGORIES = [
  {
    name: 'Academic',
    model: '/models/book_web.glb',
    shape: null,
    reversed: false, // card left / model right
    tilt: 0.95, // viewing elevation in radians — both slabs are flat, so we look down on them
    edgeAngle: 20, // degrees; edges between faces flatter than this are dropped
    baseRotation: [0, 0, 0],
    description:
      'Textbooks, calculators, lab supplies — everything you only need for one semester.',
  },
  {
    name: 'Electronics',
    model: '/models/chip_web.glb',
    shape: null,
    reversed: true, // card right / model left
    tilt: 0.95,
    edgeAngle: 20,
    baseRotation: [0, 0, 0],
    description:
      'Laptops, monitors, chargers, dorm-room tech looking for its next owner.',
  },
  {
    name: 'Other',
    model: '/models/other_web.glb'`
    shape: null,
    reversed: false, // card left / model right
    tilt: 0.95,
    edgeAngle: 20,
    baseRotation: [Math.PI / 2, 0, 0], // lay the ring flat so the turntable view suits it
    description:
      'Furniture, kitchen stuff, bikes — the things that don\u2019t fit anywhere else.',
  },
]

// hero + 3×(enter/read) + closing
export const TOTAL_STEPS = 1 + CATEGORIES.length * 2 + 1
// "01 / 04" style labels: three categories + the closing card
export const LABEL_TOTAL = String(CATEGORIES.length + 1).padStart(2, '0')

export function categoryIndexForStep(step) {
  if (step === 0 || step === TOTAL_STEPS - 1) return null
  return Math.floor((step - 1) / 2)
}

export function isClosingStep(step) {
  return step === TOTAL_STEPS - 1
}

// 'enter' = title only, 'read' = title shrunk + description visible
export function phaseForStep(step) {
  return (step - 1) % 2 === 0 ? 'enter' : 'read'
}

// state of category `i` given the current global step
export function categoryState(i, step) {
  if (categoryIndexForStep(step) !== i) return 'idle'
  return phaseForStep(step) === 'enter' ? 'entering' : 'reading'
}
