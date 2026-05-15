import { ContactForm } from "@/components/ContactForm"
import type { ContactForm as ContactFormData } from "@/types/domain"

type Props = {
  email: string
  linkedinUrl: string
  onSubmit: (data: ContactFormData) => Promise<void>
}

export function Contact({ email, linkedinUrl, onSubmit }: Props) {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="container mx-auto px-4 py-20 md:py-28"
    >
      <div className="mx-auto max-w-3xl space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary/80">
          Fale comigo
        </p>
        <h2 id="contact-title" className="text-3xl font-bold tracking-tight md:text-4xl">
          Contato
        </h2>
        <p className="text-muted-foreground">
          Tem um projeto, vaga ou conversa técnica em mente? Envie uma mensagem abaixo ou use os
          canais alternativos.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-3xl space-y-8">
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <li>
            <a
              href={`mailto:${email}`}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {email}
            </a>
          </li>
          <li>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              LinkedIn
            </a>
          </li>
        </ul>

        <div className="rounded-xl border bg-card/60 p-6 shadow-sm backdrop-blur md:p-8">
          <ContactForm onSubmit={onSubmit} />
        </div>
      </div>
    </section>
  )
}
