"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Coffee } from "lucide-react"

const DEFAULT_UPI_VPA = (process.env.NEXT_PUBLIC_UPI_VPA as string) || "7268955274@ptsbi"
const DEFAULT_PAYEE_NAME = (process.env.NEXT_PUBLIC_PAYEE_NAME as string) || "Coffee Support"
const DEFAULT_NOTE = "Thanks for the coffee!"

type AmountSelectorProps = {
  amount: string
  setAmount: (val: string) => void
}

function AmountSelector({ amount, setAmount }: AmountSelectorProps) {
  const presets = [50, 100, 200, 500]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-2">
        {presets.map((val) => {
          const active = Number(amount) === val
          return (
            <button
              key={val}
              type="button"
              onClick={() => setAmount(String(val))}
              className={cn(
                "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                active ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted",
              )}
              aria-pressed={active}
            >
              ₹{val}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="custom-amount" className="sr-only">
          Custom amount
        </label>
        <div className="flex items-center rounded-md border border-input bg-background px-3 py-2">
          <span className="mr-2 text-muted-foreground">₹</span>
          <input
            id="custom-amount"
            inputMode="decimal"
            pattern="[0-9]*"
            value={amount}
            onChange={(e) => {
              const v = e.target.value.replace(/[^\d.]/g, "")
              setAmount(v)
            }}
            placeholder="Enter any amount"
            className="w-40 bg-transparent outline-none placeholder:text-muted-foreground"
            aria-label="Custom amount in rupees"
          />
        </div>
        <span className="text-xs text-muted-foreground">No minimum or maximum</span>
      </div>
    </div>
  )
}

function buildUpiUrl({
  pa,
  pn,
  am,
  tn,
}: {
  pa: string
  pn?: string
  am?: string
  tn?: string
}) {
  const params = new URLSearchParams()
  params.set("pa", pa) // Payee VPA (required)
  if (pn) params.set("pn", pn) // Payee Name
  if (am && !isNaN(Number(am)) && Number(am) > 0) {
    params.set("am", Number(am).toFixed(2))
  }
  params.set("cu", "INR") // Currency
  if (tn) params.set("tn", tn) // Transaction note
  return `upi://pay?${params.toString()}`
}

export default function Page() {
  const [amount, setAmount] = useState<string>("")
  const [note, setNote] = useState<string>(DEFAULT_NOTE)
  const [vpa, setVpa] = useState<string>(DEFAULT_UPI_VPA)

  const upiUrl = useMemo(() => {
    return buildUpiUrl({
      pa: vpa.trim(),
      pn: DEFAULT_PAYEE_NAME,
      am: amount.trim(),
      tn: note.trim(),
    })
  }, [amount, note, vpa])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(upiUrl)
      alert("Payment link copied!")
    } catch {
      alert("Unable to copy. Long-press and copy the button/link instead.")
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="mx-auto max-w-md px-6 py-10 text-center">
        <h1 className="text-pretty font-serif text-3xl font-bold text-foreground">Enjoy a Coffee on Me!</h1>
        <p className="mt-2 text-foreground/80">Your support fuels my creativity.</p>
      </header>

      {/* Card */}
      <section
        aria-label="Coffee card"
        className="mx-auto max-w-md rounded-xl border border-border bg-card p-5 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary"
            aria-hidden="true"
          >
            <Coffee className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="font-serif text-lg font-semibold text-card-foreground">Fuel the creativity</h2>
            <p className="text-sm text-muted-foreground">Pay securely with UPI</p>
          </div>
        </div>

        <div className="mt-6">
          <AmountSelector amount={amount} setAmount={setAmount} />
        </div>

        <div className="mt-4">
          <label htmlFor="note" className="mb-1 block text-sm font-medium text-foreground">
            Note (optional)
          </label>
          <input
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Say something nice..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <a
            href={upiUrl}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-3 text-center text-base font-semibold text-primary-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label={`Buy me a coffee for ₹${amount || "any amount"}`}
          >
            Buy Me a Coffee
          </a>
          <button
            type="button"
            onClick={copyToClipboard}
            className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            Copy payment link
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Works best on mobile with Google Pay, PhonePe, Paytm, etc.
          </p>
        </div>

        <div className="mt-6">
          <label htmlFor="vpa" className="mb-1 block text-xs font-medium text-muted-foreground">
            Your UPI ID (VPA)
          </label>
          <input
            id="vpa"
            value={vpa}
            onChange={(e) => setVpa(e.target.value)}
            placeholder="e.g. 7268955274@ptsbi or name@bank"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Replace with your exact UPI ID for best reliability. Phone number alone may not work unless mapped as a VPA.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-10 bg-muted py-6">
        <p className="mx-auto max-w-md px-6 text-center text-xs text-foreground/80">Thank you for your support!</p>
      </footer>
    </main>
  )
}
