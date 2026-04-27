import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productsAPI, categoriesAPI, brandsAPI } from '../../lib/api'
import ProductCard from '../../components/public/ProductCard'
import {
  ArrowRight, Zap, Shield, Truck, HeadphonesIcon,
  ChevronLeft, ChevronRight, Tag, Star,
} from 'lucide-react'
import { formatCurrency, getImageUrl } from '../../lib/utils'

const HERO_SLIDES = [
  {
    id: 1,
    title: 'Bangun Impian\nAnda Bersama Kami',
    subtitle: 'Material bangunan berkualitas dengan harga terbaik. Tersedia ribuan produk untuk kebutuhan konstruksi Anda.',
    cta: 'Belanja Sekarang',
    ctaLink: '/products',
    bg: 'from-primary-700 to-primary-900',
    accent: 'bg-primary-600',
  },
  {
    id: 2,
    title: 'Promo Spesial\nHingga 50% Off',
    subtitle: 'Dapatkan penawaran terbaik untuk semen, cat, keramik, dan masih banyak lagi. Stok terbatas!',
    cta: 'Lihat Promo',
    ctaLink: '/products?is_featured=true',
    bg: 'from-orange-700 to-red-800',
    accent: 'bg-orange-600',
  },
]

const FEATURES = [
  { icon: Truck, title: 'Gratis Ongkir Wilayah Surabaya', desc: 'Min. pembelian Rp 500.000' },
  { icon: Shield, title: 'Produk Original', desc: 'Garansi 100% asli' },
  { icon: Zap, title: 'Pengiriman Cepat', desc: 'Proses 1 hari kerja' },
  // { icon: HeadphonesIcon, title: 'CS 24 Jam', desc: 'Siap membantu Anda' },
]

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [promoProducts, setPromoProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [heroIdx, setHeroIdx] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [feat, promo, cats, brnds] = await Promise.allSettled([
          productsAPI.getFeatured(8),
          productsAPI.getPromo({ limit: 8 }),
          categoriesAPI.getAll({ is_active: true, parent_id: 'null' }),
          brandsAPI.getAll({ is_active: true, limit: 10 }),
        ])
        if (feat.status === 'fulfilled') setFeaturedProducts(feat.value.data.data || [])
        if (promo.status === 'fulfilled') setPromoProducts(promo.value.data.data?.products || promo.value.data.data || [])
        if (cats.status === 'fulfilled') setCategories(cats.value.data.data?.slice(0, 8) || [])
        if (brnds.status === 'fulfilled') setBrands(brnds.value.data.data?.slice(0, 8) || [])
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  // Auto-advance hero
  useEffect(() => {
    const t = setTimeout(() => setHeroIdx((i) => (i + 1) % HERO_SLIDES.length), 5000)
    return () => clearTimeout(t)
  }, [heroIdx])

  const slide = HERO_SLIDES[heroIdx]

  return (
    <div>
      {/* Hero Slider */}
      <section className={`relative bg-gradient-to-br ${slide.bg} text-white overflow-hidden`}>
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <span className={`inline-block ${slide.accent} text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider`}>
              TB. CAHAYA ALAM
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4 whitespace-pre-line">
              {slide.title}
            </h1>
            <p className="text-white/80 text-base md:text-lg mb-8 leading-relaxed">
              {slide.subtitle}
            </p>
            <div className="flex items-center gap-3">
              <Link to={slide.ctaLink} className="bg-white text-primary-700 font-bold px-6 py-3 rounded-full hover:bg-primary-50 transition-colors inline-flex items-center gap-2 shadow-lg">
                {slide.cta} <ArrowRight size={16} />
              </Link>
              <Link to="/products" className="border border-white/40 text-white font-semibold px-6 py-3 rounded-full hover:bg-white/10 transition-colors">
                Lihat Katalog
              </Link>
            </div>
          </div>
        </div>

        {/* Slide controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIdx(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === heroIdx ? 'bg-white w-6' : 'bg-white/40'}`}
            />
          ))}
        </div>
        <button
          onClick={() => setHeroIdx((heroIdx - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => setHeroIdx((heroIdx + 1) % HERO_SLIDES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </section>

      {/* Feature badges */}
      <section className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">Belanja per Kategori</h2>
              <p className="text-sm text-gray-500 mt-0.5">Temukan produk sesuai kebutuhan</p>
            </div>
            <Link to="/products" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
              Semua <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category_id=${cat.id}`}
                className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-primary-300 hover:shadow-md transition-all group text-center"
              >
                {cat.image ? (
                  <img src={getImageUrl(cat.image)} alt={cat.name} className="w-12 h-12 object-contain" />
                ) : (
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-2xl">🧱</div>
                )}
                <span className="text-xs font-semibold text-gray-700 group-hover:text-primary-700 transition-colors line-clamp-2 leading-tight">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Star size={16} className="text-amber-400 fill-amber-400" />
              <h2 className="text-xl font-extrabold text-gray-900">Produk Unggulan</h2>
            </div>
            <p className="text-sm text-gray-500">Produk terpilih dengan kualitas terbaik</p>
          </div>
          <Link to="/products?is_featured=true" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
            Lihat Semua <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">📦</p>
            <p className="font-medium">Produk unggulan belum tersedia</p>
          </div>
        )}
      </section>

      {/* Promo Banner */}
      <section className="bg-gradient-to-r from-red-600 to-orange-500 py-8 my-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-white">
            <div className="flex items-center gap-2 mb-1">
              <Tag size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">Penawaran Terbatas</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold">Flash Sale Hari Ini!</h2>
            <p className="text-white/80 text-sm mt-1">Diskon hingga 50% untuk produk pilihan. Jangan sampai kehabisan!</p>
          </div>
          <Link
            to="/products?is_featured=true"
            className="shrink-0 bg-white text-red-600 font-bold px-6 py-3 rounded-full hover:bg-red-50 transition-colors inline-flex items-center gap-2 shadow-lg"
          >
            Belanja Promo <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Promo Products */}
      {promoProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Tag size={16} className="text-red-500" />
                <h2 className="text-xl font-extrabold text-gray-900">Produk Promo</h2>
              </div>
              <p className="text-sm text-gray-500">Harga spesial, kualitas tetap terjaga</p>
            </div>
            <Link to="/products?is_featured=true" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
              Lihat Semua <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {promoProducts.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <section className="bg-white border-t border-gray-100 py-10">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-center text-xl font-extrabold text-gray-900 mb-6">Brand Terpercaya</h2>
            <div className="flex flex-wrap justify-center items-center gap-6">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  to={`/products?brand_id=${brand.id}`}
                  className="flex items-center justify-center px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-sm transition-all"
                >
                  {brand.logo ? (
                    <img src={getImageUrl(brand.logo)} alt={brand.name} className="h-8 object-contain" />
                  ) : (
                    <span className="text-sm font-bold text-gray-700">{brand.name}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-gray-900 text-white py-14">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Siap Membangun Hunian Impian?</h2>
          <p className="text-gray-400 mb-7 text-base">Temukan semua kebutuhan material bangunan Anda di sini. Kualitas terjamin, harga bersaing.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/products" className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-7 py-3 rounded-full transition-colors inline-flex items-center gap-2">
              Mulai Belanja <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
