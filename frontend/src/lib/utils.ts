import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// essa função é usada para combinar classes do Tailwind CSS, garantindo que as classes sejam mescladas corretamente,
// evitando conflitos e redundâncias. ela aceita uma lista de classes como argumentos e retorna uma string de classes combinadas.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}