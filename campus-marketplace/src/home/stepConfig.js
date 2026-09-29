export const CATEGORIES = [
  {
    name: 'Academic',
    model: '/models/book_web.glb',
    shape: null,
    reversed: false,
    tilt: 0.95,
    edgeAngle: 20,
    baseRotation: [0, 0, 0],
    description:
      'Textbooks, calculators, lab supplies — everything you only need for one semester.',
  },
  {
    name: 'Electronics',
    model: '/models/chip_web.glb',
    shape: null,
    reversed: true,
    tilt: 0.95,
    edgeAngle: 20,
    baseRotation: [0, 0, 0],
    description:
      'Laptops, monitors, chargers, dorm-room tech looking for its next owner.',
  },
  {
    name: 'Other',
    model: '/models/other_web.glb',
    shape: null,
    reversed: false,
    tilt: 0.95,
    edgeAngle: 20,
    baseRotation: [0, 0, 0],
    description:
      'Furniture, kitchen stuff, bikes — the things that don’t fit anywhere else.',
  },
]

export const TOTAL_STEPS = 1 + CATEGORIES.length * 2 + 1

export const LABEL_TOTAL = String(CATEGORIES.length + 1).padStart(2, '0')

export function categoryIndexForStep(step) {
  if (step === 0 || step === TOTAL_STEPS - 1) return null
  return Math.floor((step - 1) / 2)
}

export function isClosingStep(step) {
  return step === TOTAL_STEPS - 1
}

export function phaseForStep(step) {
  return (step - 1) % 2 === 0 ? 'enter' : 'read'
}

export function categoryState(i, step) {
  if (categoryIndexForStep(step) !== i) return 'idle'
  return phaseForStep(step) === 'enter' ? 'entering' : 'reading'
}
