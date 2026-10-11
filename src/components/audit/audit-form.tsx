"use client"

import { useRef, useState } from "react"
import { ArrowRight, CircleAlert, CircleCheck, LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Formspree form ID, e.g. "xyzabcd". Public by design (it's in the form's URL), so NEXT_PUBLIC is fine.
// Set it in .env.local; until then the form explains it isn't connected yet.
const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID

type Field = "name" | "email" | "website"
type Errors = Partial<Record<Field, string>>
type Status = "idle" | "submitting" | "success" | "error" | "not-connected"

function validate(data: FormData): Errors {
  const errors: Errors = {}
  const name = String(data.get("name") ?? "").trim()
  const email = String(data.get("email") ?? "").trim()
  const website = String(data.get("website") ?? "").trim()

  if (!name) errors.name = "Tell us your name so we know who to send it to."
  if (!email) errors.email = "Add your work email. That's where the audit goes."
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "That email looks off. Check for typos, like a missing @."
  if (!website) errors.website = "Add your website so we know which brand to test."
  else if (!/^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/i.test(website)) errors.website = "Enter a site like yourbrand.com."
  return errors
}

const inputClass = "h-12 rounded-xl bg-card px-4 text-base md:text-base"

export function AuditForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>("idle")

  // Validate one field when the person leaves it, not on every keystroke.
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
        <h2 className="font-display text-3xl font-semibold tracking-[-0.03em]">Request received.</h2>
        <p className="text-muted-foreground">
          We&apos;ll run your audit and email the results to you. Keep an eye on your inbox (and your spam folder,
          just in case).
        </p>
      </div>
    )
  }

  const describedBy = (field: Field) => (errors[field] ? `${field}-error` : undefined)

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm">
          Your name <span className="text-signal" aria-hidden="true">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          required
          aria-invalid={!!errors.name}
          aria-describedby={describedBy("name")}
          onBlur={() => onBlur("name")}
          className={inputClass}
        />
        {errors.name && <FieldError id="name-error">{errors.name}</FieldError>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm">
          Work email <span className="text-signal" aria-hidden="true">*</span>
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={!!errors.email}
          aria-describedby={describedBy("email")}
          onBlur={() => onBlur("email")}
          className={inputClass}
        />
        {errors.email && <FieldError id="email-error">{errors.email}</FieldError>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="website" className="text-sm">
          Your website <span className="text-signal" aria-hidden="true">*</span>
        </Label>
        <Input
          id="website"
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
        {errors.website && <FieldError id="website-error">{errors.website}</FieldError>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="competitor" className="text-sm">
          Your top competitor <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input id="competitor" name="competitor" placeholder="competitor.com" className={inputClass} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="questions" className="text-sm">
          What do your buyers ask AI? <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="questions"
          name="questions"
          rows={3}
          aria-describedby="questions-help"
          placeholder="e.g. best bookkeeping firm for startups"
          className="min-h-24 rounded-xl bg-card px-4 py-3 text-base md:text-base"
        />
        <p id="questions-help" className="text-sm text-muted-foreground">
          A question or two your customers might type. We&apos;ll add our own too.
        </p>
      </div>

      {/* Honeypot: hidden from people, bots fill it in and Formspree drops the submission */}
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      {status === "error" && (
        <FormMessage>
          Something went wrong sending your request. Check your connection and try again.
        </FormMessage>
      )}
      {status === "not-connected" && (
        <FormMessage>
          This form isn&apos;t connected to an inbox yet, so nothing was sent. (Site owner: add
          NEXT_PUBLIC_FORMSPREE_ID to .env.local.)
        </FormMessage>
      )}

      <Button
        type="submit"
        disabled={status === "submitting"}
        className="group h-12 w-full rounded-full text-[15px]"
      >
        {status === "submitting" ? (
          <>
            <LoaderCircle className="animate-spin" aria-hidden="true" />
            Sending…
          </>
        ) : (
          <>
            Get my free audit
            <ArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </>
        )}
      </Button>
      <p className="text-center text-sm text-muted-foreground">No obligation. No spam. Just the results.</p>
    </form>
  )
}

function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="flex items-start gap-1.5 text-sm text-destructive">
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {children}
    </p>
  )
}

function FormMessage({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
      <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
      {children}
    </p>
  )
}
