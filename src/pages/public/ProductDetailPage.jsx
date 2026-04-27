import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { productsAPI } from '../../lib/api'
import { formatCurrency, getDiscountPercent, getImageUrl } from '../../lib/utils'
import {
  Star, Package, Truck, Shield,
  Tag, ChevronLeft, ChevronRight, Share2, MessageCircle,
} from 'lucide-react'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imgIdx, setImgIdx] = useState(0)
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: product?.name, url })
        return
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    setLoading(true)
    productsAPI.getById(slug)
      .then(({ data }) => setProduct(data.data))
      .catch(() => setError('Produk tidak ditemukan'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="animate-pulse grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-200 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-8 bg-gray-200 rounded" />
          <div className="h-8 bg-gray-200 rounded w-2/3" />
          <div className="h-24 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  )

  if (error || !product) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-4">😕</div>
      <h2 className="text-xl font-bold text-gray-700 mb-2">Produk tidak ditemukan</h2>
      <Link to="/products" className="btn-primary mt-4">Kembali ke Produk</Link>
    </div>
  )

  const images = product.images?.length > 0 ? product.images : [null]
  const discount = getDiscountPercent(product.price, product.promo_price)

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600">Beranda</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary-600">Produk</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link to={`/products?category_id=${product.category.id}`} className="hover:text-primary-600">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image gallery */}
        <div>
          <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 mb-3">
            <img
              src={getImageUrl(images[imgIdx])}
              alt={product.name}
              className="w-full h-full object-contain"
              onError={(e) => { e.target.src = `https://placehold.co/600x600/f3f4f6/9ca3af?text=${encodeURIComponent(product.name?.slice(0, 15) || 'Produk')}` }}
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                -{discount}%
              </span>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setImgIdx((imgIdx - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setImgIdx((imgIdx + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === imgIdx ? 'border-primary-500' : 'border-gray-200'}`}
                >
                  <img
                    src={getImageUrl(img)}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://placehold.co/80x80/f3f4f6/9ca3af?text=?' }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div>
          {product.category && (
            <Link
              to={`/products?category_id=${product.category.id}`}
              className="text-sm text-primary-600 font-semibold hover:underline"
            >
              {product.category.name}
            </Link>
          )}
          <h1 className="text-2xl font-extrabold text-gray-900 mt-1 mb-3 leading-snug">
            {product.name}
          </h1>


          {/* Price */}
          <div className="bg-primary-50 rounded-xl p-4 mb-5">
            {product.promo_price && product.promo_price < product.price ? (
              <div>
                <span className="text-sm text-gray-400 line-through">{formatCurrency(product.price)}</span>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-extrabold text-primary-700">{formatCurrency(product.promo_price)}</span>
                  <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">per {product.unit || 'pcs'}</p>
              </div>
            ) : (
              <div>
                <span className="text-3xl font-extrabold text-gray-900">{formatCurrency(product.price)}</span>
                <p className="text-xs text-gray-500 mt-1">per {product.unit || 'pcs'}</p>
              </div>
            )}
          </div>

          {/* Stock & brand */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-0.5">Stok</p>
              <p className={`font-bold text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock > 0 ? `${product.stock} ${product.unit || 'pcs'}` : 'Stok Habis'}
              </p>
            </div>
            {product.brand && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-0.5">Brand</p>
                <p className="font-bold text-sm text-gray-800">{product.brand.name}</p>
              </div>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-5">
              <h3 className="font-bold text-gray-900 mb-2">Deskripsi Produk</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {/* Shipping info */}
          <div className="space-y-2 mb-6">
            {product.free_shipping && (
              <div className="flex items-center gap-2.5 text-sm text-gray-600">
                <Tag size={15} className="text-green-500 shrink-0" />
                <span className="font-medium text-green-700">Gratis Ongkir</span>
              </div>
            )}
            {product.shipping_info && (
              <div className="flex items-center gap-2.5 text-sm text-gray-600">
                <Truck size={15} className="text-blue-500 shrink-0" />
                <span>{product.shipping_info}</span>
              </div>
            )}
            {product.shipping_days && (
              <div className="flex items-center gap-2.5 text-sm text-gray-600">
                <Package size={15} className="text-primary-500 shrink-0" />
                <span>Estimasi {product.shipping_days} hari kerja</span>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-sm text-gray-600">
              <Shield size={15} className="text-gray-400 shrink-0" />
              <span>Produk original & bergaransi</span>
            </div>
          </div>

          {product.stock === 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center text-red-600 font-semibold">
              Maaf, stok produk ini sedang habis
            </div>
          )}

          <div className="flex gap-3 mt-2">
            <a
              href={(() => {
                const harga = product.promo_price && product.promo_price < product.price
                  ? formatCurrency(product.promo_price)
                  : formatCurrency(product.price)
                const msg = [
                  `Halo, saya ingin memesan produk berikut:`,
                  ``,
                  `*${product.name}*`,
                  product.sku ? `SKU: ${product.sku}` : null,
                  product.category ? `Kategori: ${product.category.name}` : null,
                  product.brand ? `Brand: ${product.brand.name}` : null,
                  `Harga: ${harga} / ${product.unit || 'pcs'}`,
                  product.stock > 0 ? `Stok tersedia: ${product.stock} ${product.unit || 'pcs'}` : `⚠️ Stok habis`,
                  ``,
                  `Link produk: ${window.location.href}`,
                  ``,
                  `Mohon konfirmasi ketersediaan dan informasi pengiriman. Terima kasih!`,
                ].filter(Boolean).join('\n')
                return `https://wa.me/6281230707932?text=${encodeURIComponent(msg)}`
              })()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex-1 justify-center !bg-green-600 hover:!bg-green-700"
            >
              <MessageCircle size={16} /> Pesan Sekarang
            </a>
            <button
              onClick={handleShare}
              className="btn-secondary px-4 min-w-[44px]"
              title="Bagikan"
            >
              {copied ? <span className="text-xs font-medium text-green-600">Tersalin!</span> : <Share2 size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
