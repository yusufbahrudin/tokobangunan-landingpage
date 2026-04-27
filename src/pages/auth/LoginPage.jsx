import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ShoppingBag, Eye, EyeOff, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Email dan password wajib diisi')
      return
    }
    setLoading(true)
    try {
      const user = await login(form)
      toast.success(`Selamat datang, ${user.name}!`)
      if (user.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Email atau password salah'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <Link to="/" className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
                <ShoppingBag size={24} className="text-white" />
              </div>
              <div>
                <div className="font-extrabold text-xl text-gray-900 leading-none">Galangan Rizal</div>
                <div className="text-primary-600 text-xs font-semibold">Toko Bahan Bangunan</div>
              </div>
            </Link>
            <h1 className="text-xl font-extrabold text-gray-900 mt-4">Masuk</h1>
            {/* <p className="text-sm text-gray-500 mt-1">Login sebagai admin untuk mengelola toko</p> */}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Masukkan email"
                className="input"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Masukkan password"
                  className="input pr-11"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </span>
              ) : 'Masuk'}
            </button>
          </form>

          {/* <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Belum punya akun?{' '}
              <Link to="/register" className="text-primary-600 font-semibold hover:underline">
                Daftar sekarang
              </Link>
            </p>
            <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 block mt-2">
              ← Kembali ke Beranda
            </Link>
          </div> */}
        </div>

        {/* Demo hint */}
        {/* <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-center text-xs text-amber-700">
          <p className="font-semibold mb-1">Demo Admin Credentials</p>
          <p>Email: <code className="bg-amber-100 px-1 rounded">admin@galaganrizal.com</code></p>
          <p className="mt-0.5">Password: <code className="bg-amber-100 px-1 rounded">Admin123!</code></p>
        </div> */}
      </div>
    </div>
  )
}
