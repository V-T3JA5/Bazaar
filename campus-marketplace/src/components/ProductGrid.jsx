import ProductCard from './ProductCard.jsx'

export default function ProductGrid({ products, emptyMessage = 'No listings yet.' }) {
  if (!products.length) {
    return <p className="product-grid__empty">{emptyMessage}</p>
  }

  return (
    <div className="product-grid">
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
