import { useUI } from '../context/UIContext.jsx'

export default function ProductCard({ product }) {
  const { openDetail } = useUI()

  return (
    <button className="product-card" onClick={() => openDetail(product)}>
      <div className="product-card__image">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.title} loading="lazy" />
        ) : (
          <div className="product-card__placeholder mono">No image</div>
        )}
      </div>
      <div className="product-card__body">
        <span className="mono product-card__category">{product.category}</span>
        <h3 className="product-card__title">{product.title}</h3>
        <span className="mono product-card__price">${product.price}</span>
      </div>

      <style>{`
        .product-card {
          display: flex;
          flex-direction: column;
          text-align: left;
          background: var(--bg-raised);
          border: 1px solid var(--border-strong);
          border-radius: 14px;
          overflow: hidden;
          padding: 0;
          width: 100%;
          box-shadow: 0 1px 2px rgba(var(--shadow-color), 0.06);
          transition: transform 0.28s var(--ease-settle), box-shadow 0.28s var(--ease-settle), border-color 0.28s ease;
        }
        .product-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent);
          box-shadow: 0 20px 32px -16px rgba(var(--shadow-color), 0.28);
        }
        .product-card__image {
          aspect-ratio: 4 / 3;
          background: var(--border);
          overflow: hidden;
        }
        .product-card__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s var(--ease-settle);
        }
        .product-card:hover .product-card__image img {
          transform: scale(1.06);
        }
        .product-card__placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
        }
        .product-card__body {
          padding: 14px 16px 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .product-card__category {
          color: var(--text-secondary);
        }
        .product-card__title {
          font-size: 1rem;
          font-weight: 600;
        }
        .product-card__price {
          color: var(--text-secondary);
        }
      `}</style>
    </button>
  )
}
