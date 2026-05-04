import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getToken, setToken } from "@/lib/cookies"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import type { AuthResponse } from "@/types"
import { Loader2 } from "lucide-react"
import api from "@/lib/api"

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {

  const navigate = useNavigate();
  const token = getToken();
  const {login} = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  useEffect(() => {
    if (token) {
      navigate({ to: '/interface', replace: true })
    }
  }, [token, navigate])

  async function handleSubmit(event: React.FormEvent) {
      event.preventDefault();
      setIsLoading(true);
      
      try {
        const response = await api.post<AuthResponse>("/auth/login", {
          email,
          senha: password,
        });

        const data = response.data;
        login(data);
        setToken(data.accessToken);
        navigate({ to: "/interface" });
      } catch (error: any) {
        const message = error.response?.data?.message // aqui ele recebe a mensagem do erro que foi definido no backend
        setError(message)
        setIsLoading(false);
      }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Lorem ipsum</CardTitle>
          <CardDescription>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. 
          </CardDescription>
        </CardHeader>


        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              </div>
              
              <div className="grid gap-6">

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>

                  <Input
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  id="password" type="password" required placeholder="••••••••"
                  />

                  {error && (
                    <p className="text-sm text-red-500 text-center">{error}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>

                  {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin"/>
                    Entrando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Entrar
                  </div>
                )}

                </Button>

              </div>

              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="#" className="underline underline-offset-4">
                  Sign up
                </a>
              </div>

            </div>
          </form>
        </CardContent>


      </Card>

      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        By clicking continue, you agree to our <a href="#">terms of service</a>{" "}
        and <a href="#">privacy policy</a>.
      </div>

    </div>
  )
}