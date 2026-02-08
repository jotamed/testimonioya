// Admin configuration
export const ADMIN_EMAILS = [
  'jotamedina@gmail.com',
  'admin@testimonioya.com',
]

export function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}
