import { useEffect, useState } from 'react'
import { useUI } from '../context/UIContext.jsx'
import { useListings } from '../context/ListingsContext.jsx'

function contactHref(contact) {
  if (contact.includes('@')) return `mailto:${contact}`
  if (/^[+\d][\d\s().-]{6,}$/.test(contact)) return `tel:${contact.replace(/[^\d+]/g, '')}`
  return null
}

export default function ProductModal() {
  const { detailProduct, closeDetail, openEditForm } = useUI()
  const { removeListing, verifyPassword } = useListings()

  const [gateOpen, setGateOpen] = useState(false)
  const [gateAction, setGateAction] = useState(null) // 'edit' | 'delete'
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [contactOpen, setContactOpen] = useState(false)

  // the modal stays mounted between products, so reset per-product state
  useEffect(() => {
    setGateOpen(false)
    setContactOpen(false)
    setPassword('')
    setError('')
  }, [detailProduct?.id])

  if (!detailProduct) return null

  const contact = (detailProduct.sellerContact || '').trim()
  const href = contact ? contactHref(contact) : null

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

        <button
          className="btn btn--accent detail-contact-btn"
          onClick={() => setContactOpen((v) => !v)}
          aria-expanded={contactOpen}
        >
          {contactOpen ? 'Hide contact details' : 'Contact seller'}
        </button>

        {contactOpen && (
          <div className="detail-contact" role="region" aria-label="Seller contact details">
            <span className="mono detail-contact__label">{detailProduct.sellerName}</span>
            {contact ? (
              href ? (
                <a className="detail-contact__value" href={href}>
                  {contact}
                </a>
              ) : (
                <span className="detail-contact__value">{contact}</span>
              )
            ) : (
              <span className="detail-contact__empty">
                This seller didn't leave contact details.
              </span>
            )}
          </div>
        )}

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
        .detail-contact-btn {
          width: 100%;
          margin-top: 16px;
        }
        .detail-contact {
          margin-top: 12px;
          padding: 14px 16px;
          border: 1px solid var(--border);
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .detail-contact__label {
          color: var(--text-secondary);
        }
        .detail-contact__value {
          font-weight: 600;
          word-break: break-all;
        }
        a.detail-contact__value {
          color: var(--accent-soft);
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .detail-contact__empty {
          color: var(--text-secondary);
          font-size: 0.9rem;
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
