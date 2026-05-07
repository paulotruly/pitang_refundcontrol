import { useEffect, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import axios from "axios"
import { Loader2 } from "lucide-react"

import { getToken } from "@/lib/cookies"
import type { RegisterRequest, User } from "@/types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const navigate = useNavigate()

  const token = getToken() || null

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // ============================================================================
  // AUTH REDIRECT
  // ============================================================================

  useEffect(() => {
    if (token) {
      navigate({ to: "/interface", replace: true })
    }
  }, [token, navigate])

  // ============================================================================
  // SUBMIT
  // ============================================================================

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    setError("")
    setSuccess("")
    setIsLoading(true)

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName) {
      setError("Nome é obrigatório")
      setIsLoading(false)
      return
    }

    if (!trimmedEmail) {
      setError("Email é obrigatório")
      setIsLoading(false)
      return
    }

    if (!emailRegex.test(trimmedEmail)) {
      setError("Email inválido")
      setIsLoading(false)
      return
    }

    if (!password) {
      setError("Senha é obrigatória")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Senha deve ter no mínimo 6 caracteres")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    try {
      await axios.post<User>("http://localhost:3000/users", {
        nome: name,
        email,
        senha: password,
      } as RegisterRequest)

      setSuccess("Conta criada com sucesso!")

      setTimeout(() => {
        navigate({ to: "/login" })
      }, 1500)

    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao criar conta")
    } finally {
      setIsLoading(false)
    }
  }

  // ============================================================================
  // UI
  // ============================================================================

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
        <div className="mb-8 text-center space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            refund control
          </h1>

          <p className="text-sm text-zinc-400">
            Crie sua conta para começar
          </p>
        </div>

        {/* Card */}
        <Card className="border border-zinc-800 bg-zinc-900/70 backdrop-blur-xl rounded-3xl shadow-2xl">

          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-white">
              Criar conta
            </CardTitle>

            <CardDescription className="text-zinc-400">
              Preencha os dados abaixo
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Nome */}
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">
                  Nome
                </Label>

                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="h-11 bg-zinc-950 border-zinc-800 text-white rounded-xl placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-white"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">
                  Email
                </Label>

                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="name@company.com"
                  className="h-11 bg-zinc-950 border-zinc-800 text-white rounded-xl placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-white"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">
                  Senha
                </Label>

                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  className="h-11 bg-zinc-950 border-zinc-800 text-white rounded-xl placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-white"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">
                  Confirmar senha
                </Label>

                <Input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  className="h-11 bg-zinc-950 border-zinc-800 text-white rounded-xl placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-white"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                  {success}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-white text-black hover:bg-zinc-200 font-medium transition-all"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Criar conta"
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-zinc-500">
                Já possui conta?{" "}
                <a
                  onClick={() => navigate({ to: "/login" })}
                  className="text-white hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  Entrar
                </a>
              </p>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}