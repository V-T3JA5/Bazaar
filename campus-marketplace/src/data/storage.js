// Isolated data-access layer. Every other file in the app talks to listings
// only through the functions exported here. Swapping localStorage for a real
// API later means rewriting this file only — nothing else should need to change.

const STORAGE_KEY = 'campus-marketplace:listings'

export const CATEGORIES = ['Academic', 'Electronics', 'Other']

const SEED_LISTINGS = [
  {
    id: 'seed-1',
    title: 'TI-84 Plus Graphing Calculator',
    price: 45,
    category: 'Academic',
    condition: 'Good',
    description:
      'Used for two semesters of calculus. Works perfectly, comes with the cover and a fresh set of batteries.',
    imageUrl: 'https://picsum.photos/seed/calculator/640/480',
    sellerName: 'Priya N.',
    sellerContact: 'priya.n@example.edu',
    editPassword: 'demo123',
    datePosted: '2026-08-14T10:00:00.000Z',
  },
  {
    id: 'seed-2',
    title: 'Mechanical Keyboard (Hot-swappable)',
    price: 60,
    category: 'Electronics',
    condition: 'Like new',
    description:
      'Barely used, switched to a laptop-only setup. Brown switches, RGB, comes with the original box and cable.',
    imageUrl: 'https://picsum.photos/seed/keyboard/640/480',
    sellerName: 'Marcus T.',
    sellerContact: 'marcus.t@example.edu',
    editPassword: 'demo123',
    datePosted: '2026-08-20T15:30:00.000Z',
  },
  {
    id: 'seed-3',
    title: 'Mini Fridge',
    price: 55,
    category: 'Other',
    condition: 'Fair',
    description:
      'Small dorm fridge, cools well, a couple of scuffs on the side. Pickup only from North Campus.',
    imageUrl: 'https://picsum.photos/seed/fridge/640/480',
    sellerName: 'Jordan A.',
    sellerContact: '',
    editPassword: 'demo123',
    datePosted: '2026-09-01T09:15:00.000Z',
  },
]

function readAll() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      writeAll(SEED_LISTINGS)
      return SEED_LISTINGS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.error('storage: failed to read listings', err)
    return []
  }
}

function writeAll(listings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(listings))
    return true
  } catch (err) {
    console.error('storage: failed to write listings', err)
    return false
  }
}

function makeId() {
  return `listing-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function getAllListings() {
  return readAll()
}

export function getListingById(id) {
  return readAll().find((item) => item.id === id) || null
}

export function createListing(data) {
  const listings = readAll()
  const listing = {
    id: makeId(),
    title: data.title.trim(),
    price: Number(data.price) || 0,
    category: data.category,
    condition: data.condition.trim(),
    description: data.description.trim(),
    imageUrl: data.imageUrl.trim(),
    sellerName: data.sellerName.trim(),
    sellerContact: (data.sellerContact || '').trim(),
    editPassword: data.editPassword,
    datePosted: new Date().toISOString(),
  }
  writeAll([listing, ...listings])
  return listing
}

// Returns { ok: true, listing } or { ok: false, error }
export function updateListing(id, password, updates) {
  const listings = readAll()
  const index = listings.findIndex((item) => item.id === id)
  if (index === -1) return { ok: false, error: 'Listing not found.' }
  if (listings[index].editPassword !== password) {
    return { ok: false, error: 'Incorrect password.' }
  }
  const updated = { ...listings[index], ...updates, id, editPassword: listings[index].editPassword }
  listings[index] = updated
  writeAll(listings)
  return { ok: true, listing: updated }
}

// Returns { ok: true } or { ok: false, error }
export function deleteListing(id, password) {
  const listings = readAll()
  const target = listings.find((item) => item.id === id)
  if (!target) return { ok: false, error: 'Listing not found.' }
  if (target.editPassword !== password) {
    return { ok: false, error: 'Incorrect password.' }
  }
  writeAll(listings.filter((item) => item.id !== id))
  return { ok: true }
}

export function verifyPassword(id, password) {
  const listing = getListingById(id)
  return !!listing && listing.editPassword === password
}
