import { useTranslation } from "react-i18next"
import { ContactForm } from "@/components/ContactForm"
import { Section } from "@/components/Section"
import type { ContactForm as ContactFormData } from "@/types/domain"

type Props = {
  email: string
  linkedinUrl: string
  onSubmit: (data: ContactFormData) => Promise<void>
}

export function Contact({ email, linkedinUrl, onSubmit }: Props) {
  const { t } = useTranslation()
  return (
    <Section id="contact" title={t("contact.title")} subtitle={t("contact.subtitle")}>
      <div className="mx-auto max-w-3xl space-y-8">
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-body-sm">
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
              {t("contact.altChannels.linkedin")}
            </a>
          </li>
        </ul>

        <div className="rounded-xl border bg-card/60 p-6 shadow-sm backdrop-blur md:p-8">
          <ContactForm onSubmit={onSubmit} />
        </div>
      </div>
    </Section>
  )
}
