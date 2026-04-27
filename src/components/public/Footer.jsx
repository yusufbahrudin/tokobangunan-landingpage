import { Link } from 'react-router-dom'
import { ShoppingBag, Phone, MapPin, Mail, Facebook, Instagram, Youtube } from 'lucide-react'

const FOOTER_LINKS = {
  'Belanja': [
    { label: 'Semua Produk', to: '/products' },
    { label: 'Produk Unggulan', to: '/products?is_featured=true' },
    { label: 'Produk Promo', to: '/products/promo' },
  ],
  // 'Bantuan': [
  //   { label: 'Cara Berbelanja', to: '/help' },
  //   { label: 'Lacak Pesanan', to: '/track' },
  //   { label: 'Hubungi Kami', to: '/contact' },
  // ],
  // 'Tentang Kami': [
  //   { label: 'Tentang Galangan Rizal', to: '/about' },
  //   { label: 'Kebijakan Privasi', to: '/privacy' },
  //   { label: 'Syarat & Ketentuan', to: '/terms' },
  // ],
}

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <ShoppingBag size={22} className="text-white" />
              </div>
              <div>
                <div className="font-extrabold text-white text-xl leading-none">TB. CAHAYA ALAM</div>
                <div className="text-primary-400 text-xs font-medium">Toko Bahan Bangunan</div>
              </div>
            </Link>
            <p className="text-sm leading-relaxed mb-5 text-gray-400">
              Toko bahan bangunan terpercaya dengan produk lengkap dan berkualitas. 
              Melayani kebutuhan konstruksi dan renovasi rumah Anda.
            </p>
            <div className="space-y-2 text-sm">
              <a href="https://wa.me/6285730498975" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-green-400 transition-colors"><Phone size={14} className="text-primary-400" /><span>+62 857-3049-8975</span></a>
              <a href="mailto:cahayaalampusat@gmail.com" className="flex items-center gap-2 hover:text-blue-400 transition-colors"><Mail size={14} className="text-primary-400" /><span>cahayaalampusat@gmail.com</span></a>
              <a href="https://www.google.com/maps?sca_esv=af48876c36cb3322&sxsrf=ANbL-n5OjjBFPcc7OfQMW6nNtQKMG-ZWTQ:1777281751748&biw=1470&bih=798&uact=5&gs_lp=Egxnd3Mtd2l6LXNlcnAiF1RiIGNhaGF5YSBhbGFtIHN1cmFiYXlhMgUQIRigATIFECEYoAEyBRAhGKABMgUQIRigAUjzC1D3AViIC3ABeACQAQCYAbUBoAG6CaoBAzAuOLgBA8gBAPgBAZgCCaAC2AnCAggQABiABBiwA8ICERAuGIAEGMcBGK8BGLADGI4FwgIHEAAYHhiwA8ICCBAAGO8FGLADwgILEAAYgAQYogQYsAPCAg4QLhiABBjHARivARiOBcICBhAAGBYYHsICAhAmwgIFEAAY7wXCAggQABiABBiiBMICHRAuGIAEGMcBGK8BGI4FGJcFGNwEGN4EGOAE2AEBwgIEECEYFcICBRAhGJ8FmAMAiAYBkAYGugYGCAEQARgUkgcDMS44oAfAJLIHAzAuOLgH1QnCBwUxLjcuMcgHEoAIAQ&um=1&ie=UTF-8&fb=1&gl=id&sa=X&geocode=KfeT-mbw-9ctMcxKeBgvslq3&daddr=Jl.+Penjaringan+Tim.+depan+taman+kunang2+No.20,+Penjaringan+Sari,+Kec.+Rungkut,+Surabaya,+Jawa+Timur+60279" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-yellow-400 transition-colors"><MapPin size={14} className="text-primary-400" /><span>Jl. Penjaringan Timur No. 20, Rungkut, Surabaya</span></a>
            </div>
            {/* <div className="flex items-center gap-3 mt-5">
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"><Facebook size={15} /></a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"><Instagram size={15} /></a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"><Youtube size={15} /></a>
            </div> */}
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-white font-semibold text-sm mb-4">{title}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} TB. Cahaya Alam Hak cipta dilindungi.</span>
          <span>Dibuat dengan ❤️ untuk melayani kebutuhan bangunan Anda</span>
        </div>
      </div>
    </footer>
  )
}
