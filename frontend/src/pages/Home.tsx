import { useNavigate } from "@tanstack/react-router"
import { ShieldCheck, Zap, BarChart3 } from "lucide-react"

function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden flex items-center justify-center px-6">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-white/5 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 max-w-4xl w-full text-center">
        {/* Hero */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-semibold tracking-tight leading-none">
              refund control
            </h1>

            <p className="max-w-xl mx-auto text-zinc-400 text-lg leading-relaxed">
              Plataforma moderna para gerenciamento de reembolsos,
              aprovações e controle financeiro corporativo.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate({ to: "/login" })}
            className="w-full sm:w-auto px-8 h-12 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition-all duration-200"
          >
            Entrar
          </button>

          <button
            onClick={() => navigate({ to: "/register" })}
            className="w-full sm:w-auto px-8 h-12 rounded-xl border border-zinc-700 bg-zinc-900/60 backdrop-blur hover:bg-zinc-800 transition-all duration-200"
          >
            Criar conta
          </button>
        </div>

        {/* Stats/Features */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur p-5 text-left">
            <div className="mb-4 flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800">
              <ShieldCheck size={18} />
            </div>

            <h3 className="font-medium text-white">
              Segurança
            </h3>

            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              Seus dados protegidos com autenticação segura e controle de acesso.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur p-5 text-left">
            <div className="mb-4 flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800">
              <Zap size={18} />
            </div>

            <h3 className="font-medium text-white">
              Performance
            </h3>

            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              Fluxo rápido para criação, análise e aprovação de reembolsos.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur p-5 text-left">
            <div className="mb-4 flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800">
              <BarChart3 size={18} />
            </div>

            <h3 className="font-medium text-white">
              Controle
            </h3>

            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              Visualize métricas, despesas e relatórios em tempo real.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home