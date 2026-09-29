import { useState } from 'react'
import { useUI } from '../context/UIContext.jsx'
import { useListings } from '../context/ListingsContext.jsx'

const EMPTY_FORM = {
  title: '',
  price: '',
  category: '',
  condition: '',
  description: '',
  imageUrl: '',
  sellerName: '',
  sellerContact: '',
  editPassword: '',
}

export default function ProductForm() {
  const { formModal, closeForm } = useUI()
  const { categories, addListing, editListing } = useListings()

  const isEdit = formModal?.mode === 'edit'
  const [values, setValues] = useState(() =>
    isEdit
      ? { ...EMPTY_FORM, ...formModal.product, editPassword: '' }
      : { ...EMPTY_FORM, category: categories[0] },
  )
  const [error, setError] = useState('')

  if (!formModal) return null

  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!values.title.trim() || !values.category || !values.sellerName.trim()) {
      setError('Please fill in the title, category, and seller name.')
      return
    }

    const payload = {
      title: values.title.trim(),
      price: Number(values.price) || 0,
      category: values.category,
      condition: values.condition.trim(),
      description: values.description.trim(),
      imageUrl: values.imageUrl.trim(),
      sellerName: values.sellerName.trim(),
      sellerContact: values.sellerContact.trim(),
    }

    if (isEdit) {
      const result = editListing(formModal.product.id, formModal.password, payload)
      if (!result.ok) {
        setError(result.error)
        return
      }
    } else {
      if (!values.editPassword) {
        setError('Set a password so you can edit or remove this listing later.')
        return
      }
      addListing({ ...payload, editPassword: values.editPassword })
    }
    closeForm()
  }

  return (
    <div className="modal-backdrop" onClick={closeForm}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-panel__header">
          <h2>{isEdit ? 'Edit listing' : 'Add a listing'}</h2>
          <button className="modal-close" onClick={closeForm} aria-label="Close">
            ×
          </button>
        </div>

        <form className="product-form" onSubmit={handleSubmit}>
          <label>
            Title
            <input value={values.title} onChange={set('title')} required />
          </label>

          <div className="product-form__row">
            <label>
              Price ($)
              <input type="number" min="0" step="1" value={values.price} onChange={set('price')} />
            </label>
            <label>
              Category
              <select value={values.category} onChange={set('category')} required>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Condition
            <input
              value={values.condition}
              onChange={set('condition')}
              placeholder="e.g. Like new, Good, Fair"
            />
          </label>

          <label>
            Description
            <textarea rows={4} value={values.description} onChange={set('description')} />
          </label>

          <label>
            Image URL
            <input
              type="url"
              value={values.imageUrl}
              onChange={set('imageUrl')}
              placeholder="https://…"
            />
          </label>

          <label>
            Seller name
            <input value={values.sellerName} onChange={set('sellerName')} required />
          </label>

          <label>
            Contact (email or phone) — optional
            <input
              value={values.sellerContact}
              onChange={set('sellerContact')}
              placeholder="you@example.edu"
            />
            <span className="mono product-form__hint">
              Shown to buyers via a "Contact seller" button — leave blank to skip.
            </span>
          </label>

          {!isEdit && (
            <label>
              Set a password
              <input
                type="password"
                value={values.editPassword}
                onChange={set('editPassword')}
                required
              />
              <span className="mono product-form__hint">
                This just gates edits/deletes in this browser demo — it isn't real security.
              </span>
            </label>
          )}

          {error && <p className="product-form__error">{error}</p>}

          <div className="product-form__actions">
            <button type="button" className="btn btn--ghost" onClick={closeForm}>
              Cancel
            </button>
            <button type="submit" className="btn btn--accent">
              {isEdit ? 'Save changes' : 'Post listing'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .product-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .product-form label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .product-form__row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .product-form input,
        .product-form select,
        .product-form textarea {
          border: 1px solid var(--border);
          background: var(--bg);
          color: var(--text);
          border-radius: 8px;
          padding: 9px 12px;
          font-size: 0.95rem;
        }
        .product-form__hint {
          color: var(--text-secondary);
          opacity: 0.8;
        }
        .product-form__error {
          color: #ef4444;
          font-size: 0.85rem;
        }
        .product-form__actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 6px;
        }
        @media (max-width: 480px) {
          .product-form__row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
