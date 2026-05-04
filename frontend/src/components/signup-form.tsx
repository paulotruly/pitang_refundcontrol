import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import api from "@/lib/api"
import { getToken } from "@/lib/cookies"
import type { RegisterRequest, User } from "@/types"
import { useNavigate } from "@tanstack/react-router"
import axios from "axios"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {

    const navigate = useNavigate();
    const token = getToken() || null;
    
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
    if (token) {
        navigate({ to: '/interface', replace: true })
    }
    }, [token, navigate])

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const trimmedName = name.trim();
        const trimmedEmail = email.trim();

        if (!trimmedName) {
            setError("O campo nome é obrigatório");
            setIsLoading(false);
            return;
        }
        if (!trimmedEmail) {
            setError("O campo email é obrigatório");
            setIsLoading(false);
            return;
        }
        if (!emailRegex.test(trimmedEmail)) {
            setError("Formato de email inválido");
            setIsLoading(false);
            return;
        }
        if (!password) {
            setError("O campo senha é obrigatório");
            setIsLoading(false);
            return;
        }
        if (!confirmPassword) {
            setError("O campo confirmar senha é obrigatório");
            setIsLoading(false);
            return;
        }
        if (password !== confirmPassword) {
            setError("As senhas não coincidem");
            setIsLoading(false);
            return;
        }
        if (password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres");
            setIsLoading(false);
            return;
        }

        try {
        const response = await axios.post<User>("http://localhost:3000/users", {
            nome: name,
            email,
            senha: password,
        } as RegisterRequest);
        
        setIsLoading(false);
        setSuccess("Cadastro realizado com sucesso! Redirecionando para o login...");
        setTimeout(() => {
            navigate({ to: "/login" });
        }, 2000);
        } catch (error: any) {
        const message = error.response?.data?.message // aqui ele recebe a mensagem do erro que foi definido no backend
        setError(message)
        setIsLoading(false);
        }
    }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>

      <CardContent>

        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>

            <Field>
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <Input
              value={name}
              onChange={(e)=>setName(e.target.value)}
              id="name" type="text" placeholder="Your name" required />
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                id="password" type="password" required />
              <FieldDescription>
                Must be at least 6 characters long.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm password
              </FieldLabel>
              <Input
                value={confirmPassword}
                onChange={(e)=>setConfirmPassword(e.target.value)}
                id="confirm-password" type="password" required />
              <FieldDescription>Please confirm your password.</FieldDescription>
            </Field>

            {error && (
                <p className="text-sm text-red-500 text-center mt-2">{error}</p>
            )}
            {success && (
                <div className="flex flex-row gap-2">
                    <Loader2 className="h-4 w-4 animate-spin"/>
                    <p className="text-sm text-green-500 text-center mt-2">{success}</p>
                </div>
            )}

            <FieldGroup>
              <Field>

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Cadastrando...
                    </div>
                    ) : (
                    "Create account"
                    )}
                </Button>

                <FieldDescription className="px-6 text-center">
                  Already have an account? <a href="#">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>

          </FieldGroup>
        </form>

      </CardContent>
    </Card>
  )
}
