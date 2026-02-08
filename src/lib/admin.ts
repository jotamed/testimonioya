// Admin configuration
export const ADMIN_EMAILS = [
  'jorge.amg@hotmail.com',
  'admin@testimonioya.com',
]

export function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}
