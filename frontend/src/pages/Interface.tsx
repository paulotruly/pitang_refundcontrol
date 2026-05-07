import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import { Outlet } from '@tanstack/react-router'
import { useState, useEffect } from 'react';
import { Sun, Moon, LogOut } from 'lucide-react';

function Interface() {
  const navigate = useNavigate()
  const { logout } = useAuth();

  // Inverte a lógica: como o projeto já é dark, o padrão é true (dark)
  // O toggle serve para ir para white (light mode)
  const [isDark, setIsDark] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return true; // Padrão é dark (projeto já é todo dark)
  });

  // Effect que aplica/remove a classe 'dark' no HTML
  // true = dark mode (padrão do projeto), false = light mode (white)
  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleDarkMode = () => setIsDark(!isDark);

  return (
    <>
      {/* Ícone pequeno fixo no canto superior direito - sem header gigante */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {/* Toggle Dark/Light Mode - ícone pequeno */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 transition-colors shadow-lg"
          aria-label="Alternar modo claro/escuro"
        >
          {/* Se está dark, mostra Sol (clicar vai para light/white) */}
          {/* Se está light, mostra Lua (clicar vai para dark) */}
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

      </div>

      {/* Conteúdo principal sem margem do header (não tem header fixo) */}
      <div key={window.location.pathname} className="animate-fade-in">
        <Outlet />
      </div>
    </>
  )
}

export default Interface
