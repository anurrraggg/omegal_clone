"use client"

import { useMemo, useState } from "react"

function sanitizeAmount(value: string): string {
  // Allow only digits and a single dot, trim extra leading zeros
  const cleaned = value.replace(/[^0-9.]/g, "")
  const parts = cleaned.split(".")
  if (parts.length > 2) return parts.slice(0, 2).join(".")
  // limit to 2 decimal places
  if (parts[1]?.length > 2) parts[1] = parts[1].slice(0, 2)
  let normalized = parts.join(".")
  // Remove leading zeros unless immediately before dot
  normalized = normalized.replace(/^0+(?=\d)/, "")
  return normalized
}

export default function BuyCoffee() {
  // Prefer env vars if provided; fallback to the UPI VPA you shared
  const vpa = (process.env.NEXT_PUBLIC_UPI_VPA?.trim() as string | undefined) || "7268955274@ptsbi"
  const payeeName = (process.env.NEXT_PUBLIC_PAYEE_NAME?.trim() as string | undefined) || "Buy Me a Coffee"

  const [amount, setAmount] = useState<string>("")
  const [note, setNote] = useState<string>("Coffee Support")
  const [preset, setPreset] = useState<number | null>(null)

  const selectedAmount = useMemo(() => {
    if (preset !== null) return String(preset)
    return amount
  }, [preset, amount])

  const upiUrl = useMemo(() => {
    const params = new URLSearchParams()
    params.set("pa", vpa) // payee address (VPA)
    params.set("pn", payeeName) // payee name
    params.set("cu", "INR") // currency
    if (note.trim()) params.set("tn", note.trim())
    // If amount is empty, omit it so payer can enter any number in their app
    const amt = selectedAmount.trim()
    if (amt) params.set("am", amt)
    return `upi://pay?${params.toString()}`
  }, [vpa, payeeName, note, selectedAmount])

  function handleOpen() {
    // Navigate to the UPI deep link; UPI-capable apps should intercept
    window.location.href = upiUrl
  }

  const presets = [50, 100, 200] // Common quick amounts

  return (
    <div className="mt-8 rounded-xl border border-gray-200 p-5">
      <div className="flex flex-col gap-6">
        {/* Preset amounts */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {presets.map((p) => {
            const active = preset === p && !amount
            return (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setPreset(p)
                  setAmount("") // clear custom when preset picked
                }}
                className={[
                  "rounded-md border px-3 py-2 text-sm transition",
                  active
                    ? "border-amber-600 bg-amber-600 text-white"
                    : "border-gray-200 text-gray-900 hover:border-amber-600",
                ].join(" ")}
                aria-pressed={active}
                aria-label={`Set amount to ₹${p}`}
              >
                {"₹"}
                {p}
              </button>
            )
          })}
          <button
            type="button"
            onClick={() => {
              setPreset(null)
            }}
            className={[
              "rounded-md border px-3 py-2 text-sm transition",
              preset === null
                ? "border-amber-600 bg-amber-600 text-white"
                : "border-gray-200 text-gray-900 hover:border-amber-600",
            ].join(" ")}
            aria-pressed={preset === null}
            aria-label="Use custom amount"
          >
            Any amount
          </button>
        </div>

        {/* Custom amount and note */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-gray-900" htmlFor="amount">
            Amount (INR)
          </label>
          <input
            id="amount"
            inputMode="decimal"
            type="text"
            placeholder="Optional (e.g., 99 or 125.50)"
            value={amount}
            onChange={(e) => {
              setPreset(null)
              setAmount(sanitizeAmount(e.target.value))
            }}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-600"
            aria-describedby="amount-help"
          />
          <p id="amount-help" className="text-xs text-gray-500">
            Leave empty to choose any amount inside your UPI app.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-gray-900" htmlFor="note">
            Note (optional)
          </label>
          <input
            id="note"
            type="text"
            placeholder="e.g., Thanks for the content!"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>

        {/* Pay button */}
        <div className="flex flex-col items-stretch gap-3">
          <button
            type="button"
            onClick={handleOpen}
            className="w-full rounded-md bg-amber-600 px-4 py-3 text-center text-base font-semibold text-white transition hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-600"
            aria-label="Open UPI payment"
          >
            Pay via UPI
          </button>
          <a
            href={upiUrl}
            className="text-center text-sm text-gray-500 underline underline-offset-4"
            aria-label="Alternative link to open UPI payment"
          >
            Having trouble? Try this link
          </a>
          <p className="text-center text-xs text-gray-500">
            Paying to: {payeeName} ({vpa})
          </p>
        </div>
      </div>
    </div>
  )
}
