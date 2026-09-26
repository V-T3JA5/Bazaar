import HeroSection from '../home/HeroSection.jsx'
import CategorySection from '../home/CategorySection.jsx'
import FinalSection from '../home/FinalSection.jsx'

const SECTIONS = [
  {
    category: 'Academic',
    shape: 'box',
    reversed: false,
    description:
      'Textbooks, calculators, lab supplies, and everything else you only need for one semester.',
  },
  {
    category: 'Electronics',
    shape: 'icosahedron',
    reversed: true,
    description:
      'Laptops, monitors, chargers, and dorm-room tech that\u2019s looking for its next owner.',
  },
  {
    category: 'Other',
    shape: 'torus',
    reversed: false,
    description:
      'Furniture, kitchen stuff, bikes \u2014 the things that don\u2019t fit anywhere else but still matter.',
  },
]

export default function Home() {
  return (
    <>
      <HeroSection />
      {SECTIONS.map((section) => (
        <CategorySection key={section.category} {...section} />
      ))}
      <FinalSection />
    </>
  )
}
