import emailjs from "@emailjs/browser"
import type { ContactForm } from "@/types/domain"

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

export async function sendContactEmail(data: ContactForm): Promise<void> {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    throw new Error("EmailJS credentials missing — define VITE_EMAILJS_* in .env")
  }
  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      from_name: data.name,
      from_email: data.email,
      subject: data.subject,
      message: data.message,
    },
    { publicKey: PUBLIC_KEY },
  )
}
