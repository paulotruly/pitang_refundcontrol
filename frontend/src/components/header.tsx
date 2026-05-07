import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "@tanstack/react-router"
import { FileText, LogOut, FolderOpen, Settings2, User, Menu, X } from "lucide-react"
import { useState } from "react"

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate({ to: '/' })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-white hidden sm:block">
              refund control
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => navigate({ to: '/interface/solicitacoes' })}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
            >
              solicitações
            </button>
            {user?.perfil === 'ADMIN' && (
              <button
                onClick={() => navigate({ to: '/interface/categorias/' })}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
              >
                categorias
              </button>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {/* User Info - Desktop */}
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-700 border border-zinc-600">
                <User size={14} className="text-zinc-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-white leading-tight">
                  {user?.nome || 'Usuario'}
                </span>
                <span className="text-[10px] text-zinc-500 leading-tight">
                  {user?.perfil || 'Perfil'}
                </span>
              </div>
            </div>

            {/* Logout Button - Desktop */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-lg transition-colors"
            >
              <LogOut size={14} />
              <span>Sair</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-zinc-800">
            <div className="flex flex-col gap-2">
              {/* User Info - Mobile */}
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-800/30">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700 border border-zinc-600">
                  <User size={16} className="text-zinc-300" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">
                    {user?.nome || 'Usuario'}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {user?.perfil || 'Perfil'}
                  </span>
                </div>
              </div>

              <div className="h-px bg-zinc-800 my-2" />

              <button
                onClick={() => {
                  navigate({ to: '/interface' })
                  setMobileMenuOpen(false)
                }}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
              >
                <Settings2 size={16} />
                Dashboard
              </button>

              <button
                onClick={() => {
                  navigate({ to: '/interface/solicitacoes' })
                  setMobileMenuOpen(false)
                }}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
              >
                <FileText size={16} />
                Solicitacoes
              </button>

              {user?.perfil === 'ADMIN' && (
                <button
                  onClick={() => {
                    navigate({ to: '/interface/categorias/' })
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
                >
                  <FolderOpen size={16} />
                  Categorias
                </button>
              )}

              <div className="h-px bg-zinc-800 my-2" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut size={16} />
                Sair da conta
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}