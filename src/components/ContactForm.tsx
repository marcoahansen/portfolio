import { useId, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { contactFormSchema } from "@/lib/validation"
import type { ContactForm as ContactFormData } from "@/types/domain"

type Status = "idle" | "submitting" | "success" | "error"
type FieldErrors = Partial<Record<keyof ContactFormData, string>>

type Props = {
  onSubmit: (data: ContactFormData) => Promise<void>
}

const EMPTY: ContactFormData = { name: "", email: "", subject: "", message: "" }

export function ContactForm({ onSubmit }: Props) {
  const [values, setValues] = useState<ContactFormData>(EMPTY)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<Status>("idle")
  const nameId = useId()
  const emailId = useId()
  const subjectId = useId()
  const messageId = useId()
  const statusId = useId()

  function update<K extends keyof ContactFormData>(key: K, value: ContactFormData[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    void submit()
  }

  async function submit() {
    const result = contactFormSchema.safeParse(values)
    if (!result.success) {
      const next: FieldErrors = {}
      for (const issue of result.error.issues) {
        const path = issue.path[0] as keyof ContactFormData
        next[path] ??= issue.message
      }
      setErrors(next)
      setStatus("idle")
      return
    }

    setStatus("submitting")
    setErrors({})
    try {
      await onSubmit(result.data)
      setStatus("success")
      setValues(EMPTY)
    } catch {
      setStatus("error")
    }
  }

  const sending = status === "submitting"

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor={nameId} className="text-sm font-medium">
            Nome
          </label>
          <Input
            id={nameId}
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={errors.name ? "true" : "false"}
            aria-describedby={errors.name ? `${nameId}-err` : undefined}
            disabled={sending}
            autoComplete="name"
          />
          {errors.name && (
            <p id={`${nameId}-err`} className="text-xs text-destructive">
              {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor={emailId} className="text-sm font-medium">
            Email
          </label>
          <Input
            id={emailId}
            type="email"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? `${emailId}-err` : undefined}
            disabled={sending}
            autoComplete="email"
          />
          {errors.email && (
            <p id={`${emailId}-err`} className="text-xs text-destructive">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor={subjectId} className="text-sm font-medium">
          Assunto
        </label>
        <Input
          id={subjectId}
          value={values.subject}
          onChange={(e) => update("subject", e.target.value)}
          aria-invalid={errors.subject ? "true" : "false"}
          aria-describedby={errors.subject ? `${subjectId}-err` : undefined}
          disabled={sending}
        />
        {errors.subject && (
          <p id={`${subjectId}-err`} className="text-xs text-destructive">
            {errors.subject}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={messageId} className="text-sm font-medium">
          Mensagem
        </label>
        <Textarea
          id={messageId}
          rows={6}
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          aria-invalid={errors.message ? "true" : "false"}
          aria-describedby={errors.message ? `${messageId}-err` : undefined}
          disabled={sending}
        />
        {errors.message && (
          <p id={`${messageId}-err`} className="text-xs text-destructive">
            {errors.message}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={sending}>
          {sending ? "Enviando…" : "Enviar mensagem"}
        </Button>
        {status === "success" && (
          <p id={statusId} role="status" className="text-sm font-medium text-emerald-600">
            Mensagem enviada com sucesso. Em breve responderei.
          </p>
        )}
        {status === "error" && (
          <p role="alert" className="text-sm font-medium text-destructive">
            Erro ao enviar mensagem. Tente novamente em instantes.
          </p>
        )}
      </div>
    </form>
  )
}
