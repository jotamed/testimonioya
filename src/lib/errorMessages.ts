/**
 * Translates Supabase auth error messages to friendly Spanish
 */
const errorMap: [RegExp | string, string][] = [
  [/Password should contain at least one character of each/i, 'La contraseña debe incluir al menos una mayúscula, una minúscula, un número y un carácter especial (ej: !@#$)'],
  [/password should be at least/i, 'La contraseña debe tener al menos 6 caracteres'],
  [/User already registered/i, 'Este email ya está registrado. Intenta iniciar sesión.'],
  [/Invalid login credentials/i, 'Email o contraseña incorrectos'],
  [/Email not confirmed/i, 'Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.'],
  [/Email rate limit exceeded/i, 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.'],
  [/For security purposes, you can only request this after/i, 'Por seguridad, espera unos segundos antes de intentarlo de nuevo.'],
  [/New password should be different/i, 'La nueva contraseña debe ser diferente a la actual'],
  [/Unable to validate email address/i, 'La dirección de email no es válida'],
  [/Signup requires a valid password/i, 'Introduce una contraseña válida'],
  [/Auth session missing/i, 'Tu sesión ha expirado. Vuelve a iniciar sesión.'],
  [/Token has expired or is invalid/i, 'El enlace ha expirado. Solicita uno nuevo.'],
  [/reauthentication/i, 'Debes volver a autenticarte para realizar esta acción'],
]

export function translateError(message: string): string {
  if (!message) return 'Ha ocurrido un error. Inténtalo de nuevo.'
  
  for (const [pattern, translation] of errorMap) {
    if (typeof pattern === 'string') {
      if (message.includes(pattern)) return translation
    } else {
      if (pattern.test(message)) return translation
    }
  }
  
  // If no match, return a generic Spanish message instead of raw English
  // But log the original for debugging
  console.warn('Untranslated auth error:', message)
  return 'Ha ocurrido un error. Inténtalo de nuevo.'
}
