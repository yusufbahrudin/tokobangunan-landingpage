import { Link } from 'react-router-dom'
import { Star, ShoppingCart, Tag } from 'lucide-react'
import { formatCurrency, getDiscountPercent, getImageUrl, truncate } from '../../lib/utils'

export default function ProductCard({ product }) {
  const discount = getDiscountPercent(product.price, product.promo_price)
  const displayPrice = product.promo_price || product.price

  return (
    <Link
      to={`/products/${product.slug || product.id}`}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={getImageUrl(product.images?.[0])}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = `https://placehold.co/400x400/f3f4f6/9ca3af?text=${encodeURIComponent(product.name?.slice(0, 12) || 'Produk')}` }}
          loading="lazy"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
        {product.free_shipping && (
          <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <Tag size={9} /> Gratis Ongkir
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded-full">Stok Habis</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="text-xs text-primary-600 font-medium">{product.brand?.name || product.category?.name || ''}</p>
        <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-primary-700 transition-colors">
          {product.name}
        </h3>

        <div className="mt-auto pt-2">
          {product.promo_price && product.promo_price < product.price ? (
            <div>
              <span className="text-xs text-gray-400 line-through block">{formatCurrency(product.price)}</span>
              <span className="text-base font-bold text-primary-600">{formatCurrency(product.promo_price)}</span>
            </div>
          ) : (
            <span className="text-base font-bold text-gray-900">{formatCurrency(product.price)}</span>
          )}

        
        </div>
      </div>
    </Link>
  )
}
