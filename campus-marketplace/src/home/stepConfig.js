// The whole home experience is one linear sequence of discrete steps:
//   0            → hero ("Bazaar")
//   1            → category 0, title only   ("entering")
//   2            → category 0, title + copy ("reading")
//   3            → category 1, title only
//   4            → category 1, title + copy
//   5            → category 2, title only
//   6            → category 2, title + copy
// One wheel/swipe/key gesture moves exactly one step, in either direction —
// see HomeExperience for why.

export const CATEGORIES = [
  {
    name: 'Academic',
    shape: 'box',
    reversed: false, // card left / model right
    description:
      'Textbooks, calculators, lab supplies — everything you only need for one semester.',
  },
  {
    name: 'Electronics',
    shape: 'icosahedron',
    reversed: true, // card right / model left
    description:
      'Laptops, monitors, chargers, dorm-room tech looking for its next owner.',
  },
  {
    name: 'Other',
    shape: 'torus',
    reversed: false, // card left / model right
    description:
      'Furniture, kitchen stuff, bikes — the things that don\u2019t fit anywhere else.',
  },
]

export const TOTAL_STEPS = 1 + CATEGORIES.length * 2

export function categoryIndexForStep(step) {
  return step === 0 ? null : Math.floor((step - 1) / 2)
}

// 'enter' = title only, 'read' = title shrunk + description visible
export function phaseForStep(step) {
  return step === 0 ? null : (step - 1) % 2 === 0 ? 'enter' : 'read'
}

// state of category `i` given the current global step
export function categoryState(i, step) {
  if (categoryIndexForStep(step) !== i) return 'idle'
  return phaseForStep(step) === 'enter' ? 'entering' : 'reading'
}
