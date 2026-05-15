import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"
import { axe } from "vitest-axe"
import { ContactForm } from "./ContactForm"

const validInput = {
  name: "Marco Hansen",
  email: "marco@example.com",
  subject: "Olá",
  message: "Mensagem suficientemente longa para validar.",
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/nome/i), validInput.name)
  await user.type(screen.getByLabelText(/email/i), validInput.email)
  await user.type(screen.getByLabelText(/assunto/i), validInput.subject)
  await user.type(screen.getByLabelText(/mensagem/i), validInput.message)
}

describe("ContactForm", () => {
  it("CT-M5-06: renders name, email, subject, message and submit button", () => {
    render(<ContactForm onSubmit={vi.fn()} />)
    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/assunto/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mensagem/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /enviar/i })).toBeInTheDocument()
  })

  it("CT-M5-01: rejects malformed email and does not call onSubmit", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ContactForm onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText(/nome/i), validInput.name)
    await user.type(screen.getByLabelText(/email/i), "marco@")
    await user.type(screen.getByLabelText(/assunto/i), validInput.subject)
    await user.type(screen.getByLabelText(/mensagem/i), validInput.message)
    await user.click(screen.getByRole("button", { name: /enviar/i }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByLabelText(/email/i)).toHaveAttribute("aria-invalid", "true")
  })

  it("CT-M5-02: rejects message with 9 characters", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ContactForm onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText(/nome/i), validInput.name)
    await user.type(screen.getByLabelText(/email/i), validInput.email)
    await user.type(screen.getByLabelText(/assunto/i), validInput.subject)
    await user.type(screen.getByLabelText(/mensagem/i), "a".repeat(9))
    await user.click(screen.getByRole("button", { name: /enviar/i }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByLabelText(/mensagem/i)).toHaveAttribute("aria-invalid", "true")
  })

  it("CT-M5-03: rejects message with 1001 characters", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ContactForm onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText(/nome/i), validInput.name)
    await user.type(screen.getByLabelText(/email/i), validInput.email)
    await user.type(screen.getByLabelText(/assunto/i), validInput.subject)
    fireEvent.change(screen.getByLabelText(/mensagem/i), { target: { value: "a".repeat(1001) } })
    await user.click(screen.getByRole("button", { name: /enviar/i }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByLabelText(/mensagem/i)).toHaveAttribute("aria-invalid", "true")
  })

  it("CT-M5-07: calls onSubmit with parsed values when form is valid", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<ContactForm onSubmit={onSubmit} />)
    await fillValidForm(user)
    await user.click(screen.getByRole("button", { name: /enviar/i }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith(validInput)
  })

  it("CT-M5-04: disables submit button while sending (RN-M5-05)", async () => {
    const user = userEvent.setup()
    let resolveSubmit!: () => void
    const onSubmit = vi.fn(() => new Promise<void>((r) => (resolveSubmit = r)))
    render(<ContactForm onSubmit={onSubmit} />)
    await fillValidForm(user)
    await user.click(screen.getByRole("button", { name: /enviar/i }))

    expect(screen.getByRole("button", { name: /enviando/i })).toBeDisabled()
    resolveSubmit()
  })

  it("CT-M5-05: retains field values when submit fails (RN-M5-06)", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockRejectedValue(new Error("network"))
    render(<ContactForm onSubmit={onSubmit} />)
    await fillValidForm(user)
    await user.click(screen.getByRole("button", { name: /enviar/i }))

    expect(await screen.findByRole("alert")).toHaveTextContent(/erro/i)
    expect(screen.getByLabelText(/nome/i)).toHaveValue(validInput.name)
    expect(screen.getByLabelText(/email/i)).toHaveValue(validInput.email)
    expect(screen.getByLabelText(/assunto/i)).toHaveValue(validInput.subject)
    expect(screen.getByLabelText(/mensagem/i)).toHaveValue(validInput.message)
  })

  it("CT-M5-08: shows success feedback and clears form after successful submit", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<ContactForm onSubmit={onSubmit} />)
    await fillValidForm(user)
    await user.click(screen.getByRole("button", { name: /enviar/i }))

    expect(await screen.findByRole("status")).toHaveTextContent(/sucesso|enviada/i)
    expect(screen.getByLabelText(/nome/i)).toHaveValue("")
    expect(screen.getByLabelText(/mensagem/i)).toHaveValue("")
  })

  it("CT-M5-09: has no axe violations", async () => {
    const { container } = render(<ContactForm onSubmit={vi.fn()} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
