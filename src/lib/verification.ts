import crypto from "crypto";

export function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function getVerificationExpiry() {
  const expiry = new Date();

  expiry.setHours(expiry.getHours() + 24);

  return expiry;
}