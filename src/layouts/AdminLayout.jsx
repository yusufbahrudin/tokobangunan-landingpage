import { useState } from 'react'
import { Link, NavLink, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, Package, Tag, Bookmark, Users,
  Menu, X, ShoppingBag, LogOut, ChevronDown,
  Bell, Settings, ExternalLink,
} from 'lucide-react'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: Package, label: 'Produk' },
  { to: '/admin/categories', icon: Tag, label: 'Kategori' },
  { to: '/admin/brands', icon: Bookmark, label: 'Brand' },
  { to: '/admin/users', icon: Users, label: 'Pengguna' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebar, setMobileSidebar] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Berhasil keluar')
    navigate('/login')
  }

  const NavItems = ({ onItemClick }) => (
    <nav className="flex-1 overflow-y-auto py-4">
      {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onItemClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`
          }
        >
          <Icon size={18} className="shrink-0" />
          {(sidebarOpen || mobileSidebar) && <span>{label}</span>}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {mobileSidebar && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-60' : 'w-16'
        } hidden lg:flex flex-col bg-white border-r border-gray-100 transition-all duration-300 shadow-sm`}
      >
        {/* Logo */}
        <div className={`flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} h-16 border-b border-gray-100`}>
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
            <ShoppingBag size={16} className="text-white" />
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <div className="font-extrabold text-sm text-gray-900 truncate">TB. CAHAYA ALAM</div>
              <div className="text-[10px] text-primary-600 font-semibold">Admin Panel</div>
            </div>
          )}
        </div>

        <NavItems />

        {/* Bottom: toggle + user */}
        <div className="border-t border-gray-100 p-2 space-y-1">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
            {sidebarOpen && <span>Sembunyikan</span>}
          </button>
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <ExternalLink size={16} />
            {sidebarOpen && <span>Lihat Toko</span>}
          </Link>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-60 bg-white border-r border-gray-100 z-40 flex flex-col shadow-xl transform transition-transform duration-300 lg:hidden ${
          mobileSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-100">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <ShoppingBag size={16} className="text-white" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-gray-900">Tb. CAHAYA ALAM</div>
            <div className="text-[10px] text-primary-600 font-semibold">Admin Panel</div>
          </div>
          <button onClick={() => setMobileSidebar(false)} className="ml-auto text-gray-400">
            <X size={18} />
          </button>
        </div>
        <NavItems onItemClick={() => setMobileSidebar(false)} />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 gap-4 shadow-sm">
          <button
            onClick={() => setMobileSidebar(true)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100">
              <Bell size={18} />
            </button>

            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-900 leading-none">{user?.name}</p>
                <p className="text-xs text-primary-600 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-1 p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Keluar"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
