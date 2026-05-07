import { useState, useEffect } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Loader2, ShieldCheck, Zap, BarChart3 } from "lucide-react"

import api from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { getToken, setToken } from "@/lib/cookies"
import type { AuthResponse } from "@/types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const navigate = useNavigate()
  const token = getToken()
  const { login } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (token) {
      navigate({ to: "/interface", replace: true })
    }
  }, [token, navigate])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    setIsLoading(true)
    setError("")

    try {
      const response = await api.post<AuthResponse>("/auth/login", {
        email,
        senha: password,
      })

      const data = response.data

      login(data)
      setToken(data.accessToken)

      navigate({ to: "/interface" })
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Erro na autenticação"

      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4 relative overflow-hidden"
      {...props}
    >
      {/* Glow */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-white/5 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center space-y-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              refund control
            </h1>

            <p className="text-sm text-zinc-400 mt-2">
              Gerencie seus reembolsos com facilidade
            </p>
          </div>
        </div>

        {/* Card */}
        <Card className="border border-zinc-800 bg-zinc-900/70 backdrop-blur-xl rounded-3xl shadow-2xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-white">
              Entrar
            </CardTitle>

            <CardDescription className="text-zinc-400">
              Faça login para acessar sua conta
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-zinc-300 text-sm"
                >
                  E-mail
                </Label>

                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-zinc-950 border-zinc-800 text-white rounded-xl placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-white"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-zinc-300 text-sm"
                  >
                    Senha
                  </Label>

                  <a
                    href="#"
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                  </a>
                </div>

                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 bg-zinc-950 border-zinc-800 text-white rounded-xl placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-white"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              {/* Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-white text-black hover:bg-zinc-200 font-medium transition-all"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            {/* Register */}
            <div className="mt-6 text-center">
              <p className="text-sm text-zinc-500">
                Não possui conta?{" "}
                <a
                  onClick={() => navigate({ to: "/register" })}
                  className="text-white hover:text-zinc-300 transition-colors"
                >
                  Criar conta
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}