export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '-'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString))
}

export const getDiscountPercent = (price, promoPrice) => {
  if (!promoPrice || promoPrice >= price) return 0
  return Math.round(((price - promoPrice) / price) * 100)
}

export const getImageUrl = (path) => {
  if (!path) return `https://placehold.co/400x400/f3f4f6/9ca3af?text=No+Image`
  if (path.startsWith('http')) return path
  return `http://localhost:3000${path}`
}

export const truncate = (str, n = 60) => {
  if (!str) return ''
  return str.length > n ? str.slice(0, n - 3) + '...' : str
}
