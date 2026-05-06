import { render, screen } from "@testing-library/react"
import { StatusBadge } from "../status-badge"

describe("StatusBadge", () => {
  it("deve renderizar o label correto para status APROVADO", () => {
    render(<StatusBadge status="APROVADO" />)
    
    expect(screen.getByText("Aprovado")).toBeInTheDocument()
  })
  it("deve renderizar o label correto para status REJEITADO", () => {
    render(<StatusBadge status="REJEITADO" />)
    
    expect(screen.getByText("Rejeitado")).toBeInTheDocument()
  })
  it("deve aplicar a classe CSS correta para status ENVIADO", () => {
    const { container } = render(<StatusBadge status="ENVIADO" />)
    
    const badge = container.querySelector("span")
    expect(badge).toHaveClass("bg-blue-600")
    expect(badge).toHaveClass("text-blue-100")
  })
})