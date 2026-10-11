"use client"

import { useRef, useState } from "react"
import { ArrowRight, CircleCheck, LoaderCircle } from "lucide-react"

import { FieldError, FormMessage } from "@/components/audit/audit-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OriginButton } from "@/components/ui/origin-button"
import { Textarea } from "@/components/ui/textarea"
import { planOptions } from "@/lib/site"

// Same Formspree inbox as the audit form; the _subject field tells the two apart.
const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID

type Field = "name" | "email" | "website"
type Errors = Partial<Record<Field, string>>
type Status = "idle" | "submitting" | "success" | "error" | "not-connected"

function validate(data: FormData): Errors {
  const get = (k: string) => String(data.get(k) ?? "").trim()
  const errors: Errors = {}
  if (!get("name")) errors.name = "Tell us your name so we know who we're talking to."
  if (!get("email")) errors.email = "Add your work email so we can reply."
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(get("email"))) errors.email = "That email looks off. Check for typos, like a missing @."
  if (!get("website")) errors.website = "Add your website so we can take a look before we reply."
  else if (!/^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/i.test(get("website"))) errors.website = "Enter a site like yourbrand.com."
  return errors
}

const inputClass = "h-12 rounded-xl bg-card px-4 text-base md:text-base"

export function ContactForm({ defaultPlan }: { defaultPlan: string }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>("idle")
  const [plan, setPlan] = useState(defaultPlan)

  function onBlur(field: Field) {
    if (!formRef.current) return
    const fieldError = validate(new FormData(formRef.current))[field]
    setErrors((prev) => ({ ...prev, [field]: fieldError }))
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const found = validate(data)
    setErrors(found)
    const firstInvalid = (Object.keys(found) as Field[])[0]
    if (firstInvalid) {
      form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus()
      return
    }
    if (!FORMSPREE_ID) {
      setStatus("not-connected")
      return
    }

    const planLabel = planOptions.find((p) => p.value === data.get("plan"))?.label ?? "Not sure yet"
    data.set("plan", planLabel)
    data.set("_subject", `New plan inquiry: ${planLabel}`)

    setStatus("submitting")
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      })
      setStatus(res.ok ? "success" : "error")
    } catch {
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="flex flex-col items-start gap-4 py-6">
        <span className="flex size-12 items-center justify-center rounded-full bg-signal/10 text-signal">
          <CircleCheck className="size-6" aria-hidden="true" />
        </span>
        <h2 className="font-display text-3xl font-semibold tracking-[-0.03em]">Message sent.</h2>
        <p className="text-muted-foreground">
          Thanks. We&apos;ll take a look at your site and reply by email. Keep an eye on your inbox (and your spam
          folder, just in case).
        </p>
      </div>
    )
  }

  const describedBy = (f: Field) => (errors[f] ? `contact-${f}-error` : undefined)

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="contact-plan" className="text-sm">
          Which plan are you interested in?
        </Label>
        <select
          id="contact-plan"
          name="plan"
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          className="h-12 w-full cursor-pointer rounded-xl border border-input bg-card px-4 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {planOptions.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name" className="text-sm">
            Your name <span className="text-signal" aria-hidden="true">*</span>
          </Label>
          <Input
            id="contact-name"
            name="name"
            autoComplete="name"
            required
            aria-invalid={!!errors.name}
            aria-describedby={describedBy("name")}
            onBlur={() => onBlur("name")}
            className={inputClass}
          />
          {errors.name && <FieldError id="contact-name-error">{errors.name}</FieldError>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email" className="text-sm">
            Work email <span className="text-signal" aria-hidden="true">*</span>
          </Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={!!errors.email}
            aria-describedby={describedBy("email")}
            onBlur={() => onBlur("email")}
            className={inputClass}
          />
          {errors.email && <FieldError id="contact-email-error">{errors.email}</FieldError>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-website" className="text-sm">
          Your website <span className="text-signal" aria-hidden="true">*</span>
        </Label>
        <Input
          id="contact-website"
          name="website"
          inputMode="url"
          autoComplete="url"
          placeholder="yourbrand.com"
          required
          aria-invalid={!!errors.website}
          aria-describedby={describedBy("website")}
          onBlur={() => onBlur("website")}
          className={inputClass}
        />
        {errors.website && <FieldError id="contact-website-error">{errors.website}</FieldError>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message" className="text-sm">
          Anything we should know? <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="contact-message"
          name="message"
          rows={4}
          placeholder="Your goals, competitors, timeline, questions…"
          className="min-h-28 rounded-xl bg-card px-4 py-3 text-base md:text-base"
        />
      </div>

      {/* Honeypot: hidden from people, bots fill it in and Formspree drops the submission */}
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      {status === "error" && (
        <FormMessage>Something went wrong sending your message. Check your connection and try again.</FormMessage>
      )}
      {status === "not-connected" && (
        <FormMessage>
          This form isn&apos;t connected to an inbox yet, so nothing was sent. (Site owner: add NEXT_PUBLIC_FORMSPREE_ID
          to .env.local.)
        </FormMessage>
      )}

      <OriginButton type="submit" variant="primary" loading={status === "submitting"} className="group w-full">
        {status === "submitting" ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            Sending…
          </>
        ) : (
          <>
            Send message
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </>
        )}
      </OriginButton>
    </form>
  )
}
