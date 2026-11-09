/**
 * "Continue Reading" gate test.
 *
 * Each visitor is put in one group and stays there (localStorage):
 *   - gate:    articles are cut after paragraph 4 behind "Continue Reading"
 *   - no_gate: the whole article is shown straight away
 *
 * Only articles long enough to show the gate (6+ paragraphs) are part of the test. Every
 * analytics event sent from such an article carries `gate_variant`; events
 * from other pages carry `not_eligible`, so the groups can be compared in GA4.
 *
 * NEXT_PUBLIC_READ_MORE_TEST_SPLIT sets the share of visitors in `no_gate`
 * (0–1, default 0.5). Use 0 to show the gate to everyone, 1 to remove it.
 * For QA, add ?gate=on or ?gate=off to an article URL to force a group.
 */

export type GateVariant = 'gate' | 'no_gate'

const STORAGE_KEY = 'exp_read_more_gate_v1'

function noGateShare(): number {
  const raw = Number(process.env.NEXT_PUBLIC_READ_MORE_TEST_SPLIT ?? '0.5')
  if (!Number.isFinite(raw)) return 0.5
  return Math.min(1, Math.max(0, raw))
}

declare global {
  interface Window {
    __gateVariant?: GateVariant
    __gateTestEligible?: boolean
  }
}

/** The visitor's group. Call only in the browser (e.g. inside useEffect). */
export function getGateVariant(): GateVariant {
  const forced = new URLSearchParams(window.location.search).get('gate')
  if (forced === 'on' || forced === 'off') {
    window.__gateVariant = forced === 'on' ? 'gate' : 'no_gate'
    return window.__gateVariant
  }
  if (window.__gateVariant) return window.__gateVariant

  let variant: GateVariant | null = null
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'gate' || saved === 'no_gate') variant = saved
  } catch {}

  if (!variant) {
    variant = Math.random() < noGateShare() ? 'no_gate' : 'gate'
    try { localStorage.setItem(STORAGE_KEY, variant) } catch {}
  }

  window.__gateVariant = variant
  return variant
}

/** Marks whether the article on screen is part of the test. */
export function setGateTestEligible(eligible: boolean | undefined) {
  if (typeof window === 'undefined') return
  window.__gateTestEligible = eligible
}

/** Value for the `gate_variant` parameter on analytics events. */
export function gateVariantParam(): GateVariant | 'not_eligible' {
  if (typeof window === 'undefined') return 'not_eligible'
  return window.__gateTestEligible && window.__gateVariant ? window.__gateVariant : 'not_eligible'
}
