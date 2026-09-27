import { useState } from 'react'
import { useUI } from '../context/UIContext.jsx'
import { useListings } from '../context/ListingsContext.jsx'

export default function ProductModal() {
  const { detailProduct, closeDetail, openEditForm } = useUI()
  const { removeListing, verifyPassword } = useListings()

  const [gateOpen, setGateOpen] = useState(false)
  const [gateAction, setGateAction] = useState(null) // 'edit' | 'delete'
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (!detailProduct) return null

  const startGate = (action) => {
    setGateAction(action)
    setGateOpen(true)
    setPassword('')
    setError('')
  }

  const confirmGate = (e) => {
    e.preventDefault()
    if (gateAction === 'edit') {
      if (!verifyPassword(detailProduct.id, password)) {
        setError('Incorrect password.')
        return
      }
      openEditForm(detailProduct, password)
      return
    }
    if (gateAction === 'delete') {
      const result = removeListing(detailProduct.id, password)
      if (!result.ok) {
        setError(result.error)
        return
      }
      closeDetail()
    }
  }

  return (
    <div className="modal-backdrop" onClick={closeDetail}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-panel__header">
          <h2>{detailProduct.title}</h2>
          <button className="modal-close" onClick={closeDetail} aria-label="Close">
            ×
          </button>
        </div>

        {detailProduct.imageUrl && (
          <img className="detail-image" src={detailProduct.imageUrl} alt={detailProduct.title} />
        )}

        <div className="detail-meta">
          <span className="mono">{detailProduct.category}</span>
          <span className="mono">${detailProduct.price}</span>
          <span className="mono">{detailProduct.condition}</span>
        </div>

        <p>{detailProduct.description}</p>
        <p className="detail-seller">Listed by {detailProduct.sellerName}</p>

        {!gateOpen ? (
          <div className="product-form__actions">
            <button className="btn btn--ghost" onClick={() => startGate('delete')}>
              Delete
            </button>
            <button className="btn btn--accent" onClick={() => startGate('edit')}>
              Edit
            </button>
          </div>
        ) : (
          <form className="password-gate" onSubmit={confirmGate}>
            <label>
              Enter the listing's password to {gateAction}
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {error && <p className="product-form__error">{error}</p>}
            <div className="product-form__actions">
              <button type="button" className="btn btn--ghost" onClick={() => setGateOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn--accent">
                Confirm {gateAction}
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        .detail-image {
          width: 100%;
          border-radius: 12px;
          margin-bottom: 14px;
          aspect-ratio: 4 / 3;
          object-fit: cover;
        }
        .detail-meta {
          display: flex;
          gap: 14px;
          margin-bottom: 12px;
          color: var(--text-secondary);
        }
        .detail-seller {
          margin-top: 10px;
          font-size: 0.85rem;
        }
        .password-gate {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .password-gate label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .password-gate input {
          border: 1px solid var(--border);
          background: var(--bg);
          color: var(--text);
          border-radius: 8px;
          padding: 9px 12px;
        }
        .product-form__error {
          color: #ef4444;
          font-size: 0.85rem;
        }
        .product-form__actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 16px;
        }
      `}</style>
    </div>
  )
}
