import { createHash } from "node:crypto";

export class BookingStoreError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function tokenHash(token) {
  return createHash("sha256").update(token).digest("hex");
}

export async function bookingStore(path, { method = "GET", body, returnRepresentation = false } = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new BookingStoreError("Booking database configuration missing.", 503);
  }
  const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(returnRepresentation ? { Prefer: "return=representation" } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (response.status === 204) return null;
  const result = await response.json();
  if (!response.ok) {
    throw new BookingStoreError("Booking database request failed.", response.status, result.code);
  }
  return result;
}

export function decisionInput(input) {
  if (!input || typeof input.token !== "string" || !/^[a-f0-9]{64}$/.test(input.token) ||
      !["approve", "reject", "approve-all"].includes(input.action) ||
      (input.action !== "approve-all" &&
        (typeof input.slot !== "string" || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(input.slot)))) {
    return null;
  }
  return { p_token_hash: tokenHash(input.token), p_action: input.action,
    p_slot_id: input.action === "approve-all" ? null : input.slot };
}
