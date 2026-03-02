// src/lib/api.ts
// ─────────────────────────────────────────────────────────────
// Every backend API call, typed exactly to the spec.
// Set NEXT_PUBLIC_BACKEND_URL in .env.local
// ─────────────────────────────────────────────────────────────

import { getBackendBaseUrl } from "@/lib/backend";

const BASE = getBackendBaseUrl();

// ── Response types (matching his exact shapes) ────────────────

export interface SubmitResponse {
  message: string;
  data: {
    _id: string;          // save this — needed for /payment/success
    name: string;
    city: string;
    dogsname: string;
    paymentStatus: string;
    tier: "starter" | "founding";
    amount: number;
  };
}

export interface PaymentSuccessResponse {
  message: string;
  paymentStatus: string;
  emailSent: boolean;
  referralCreditedNow: boolean;
  referrerTotalReferralCount: number;
  data: {
    _id: string;
    cohortNumber: number;
    cohortPosition: number;
    referralCode: string;   // user's own new code to share
    tier: "starter" | "founding";
    amount: number;
  };
}

export interface ActivityEntry {
  dogName: string;
  parentName: string;
  city: string;
  cohortNumber: number;
  position: number;
  tier: "starter" | "founding";
  amount: number;
  claimedAt: string;        // ISO — convert with timeAgo()
}

export interface CohortDog {
  dogName: string;
  dogPhoto: string;         // Cloudinary URL
  position: number;
}

export interface CohortsData {
  "cohort 1": CohortDog[];
  "cohort 2": CohortDog[];
}

export interface SpotsStatus {
  currentCohortNumber: number;
  claimed: number;
  total: number;
  remaining: number;
  totalPaidOverall: number;
  lastClaimedAt: string;    // ISO — convert with timeAgo()
}

export interface ReferralValidationResponse {
  message: string;
  valid: boolean;
  data?: {
    referrerName: string;
    referralCode: string;
    referralUseCount: number;
  };
}

// ── Utility: ISO timestamp → "X mins ago" ────────────────────
export function timeAgo(iso: string): string {
  if (!iso) return "";
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return "just now";
  if (mins  < 60) return `${mins} min${mins  === 1 ? "" : "s"} ago`;
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

// ── 1. POST /submit ───────────────────────────────────────────
// multipart/form-data — browser sets Content-Type with boundary automatically
// DO NOT manually set Content-Type here
export async function submitOrder(formData: FormData): Promise<SubmitResponse> {
  const res = await fetch(`${BASE}/submit`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Submission failed. Please try again.");
  }
  return res.json();
}

// ── 2. POST /payment/success ──────────────────────────────────
export async function confirmPayment(payload: {
  submissionId: string;
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}): Promise<PaymentSuccessResponse> {
  const res = await fetch(`${BASE}/payment/success`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Payment confirmation failed. Please contact support.");
  }
  return res.json();
}

export async function validateReferralCode(
  code: string,
): Promise<ReferralValidationResponse> {
  const res = await fetch(
    `${BASE}/referral/validate?code=${encodeURIComponent(code)}`,
    { cache: "no-store" },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Failed to validate referral code.");
  }
  return res.json();
}

// ── 3. GET /activity/live ─────────────────────────────────────
export async function fetchActivity(limit = 20): Promise<ActivityEntry[]> {
  try {
    const res = await fetch(`${BASE}/activity/live?limit=${limit}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

// ── 4. GET /cohorts ───────────────────────────────────────────
export async function fetchCohorts(): Promise<CohortsData> {
  try {
    const res = await fetch(`${BASE}/cohorts`, { cache: "no-store" });
    if (!res.ok) return { "cohort 1": [], "cohort 2": [] };
    const json = await res.json();
    return json.data ?? { "cohort 1": [], "cohort 2": [] };
  } catch {
    return { "cohort 1": [], "cohort 2": [] };
  }
}

// ── 5. GET /spots/status ──────────────────────────────────────
export async function fetchSpotsStatus(): Promise<SpotsStatus> {
  const fallback: SpotsStatus = {
    currentCohortNumber: 1, claimed: 0, total: 20,
    remaining: 20, totalPaidOverall: 0, lastClaimedAt: "",
  };
  try {
    const res = await fetch(`${BASE}/spots/status`, { cache: "no-store" });
    if (!res.ok) return fallback;
    const json = await res.json();
    return json.data ?? fallback;
  } catch {
    return fallback;
  }
}
