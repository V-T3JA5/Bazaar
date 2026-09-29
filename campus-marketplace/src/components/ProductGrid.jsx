import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ProductCard from './ProductCard.jsx'
import { useMediaQuery } from '../hooks/useMediaQuery.js'

export default function ProductGrid({ products, emptyMessage = 'No listings yet.' }) {
  const gridRef = useRef(null)
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  useEffect(() => {
    if (reduceMotion || !gridRef.current) return undefined
    const cards = gridRef.current.querySelectorAll('.product-card')
    if (!cards.length) return undefined
    const ctx = gsap.context(() => {
      gsap.from(cards, {
        opacity: 0,
        y: 18,
        duration: 0.5,
        stagger: 0.05,
        ease: 'power1.out',
      })
    })
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // only the grid's first appearance — not every filter keystroke

  if (!products.length) {
    return <p className="product-grid__empty">{emptyMessage}</p>
  }

  return (
    <div ref={gridRef} className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
      <style>{`
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }
        .product-grid__empty {
          padding: 40px 0;
          text-align: center;
        }
      `}</style>
    </div>
  )
}
