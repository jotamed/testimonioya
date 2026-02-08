import { useState } from 'react'
import { Shield, Loader2, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface TwoFactorVerifyProps {
  onVerified: () => void
}

export default function TwoFactorVerify({ onVerified }: TwoFactorVerifyProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Get the user's TOTP factors
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors()
      if (factorsError) throw factorsError

      const totpFactor = factorsData.totp?.[0]
      if (!totpFactor) throw new Error('No se encontró factor TOTP')

      // Create challenge
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id,
      })
      if (challengeError) throw challengeError

      // Verify
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challenge.id,
        code,
      })
      if (verifyError) throw verifyError

      onVerified()
    } catch (err: any) {
      setError(err.message || 'Código incorrecto. Inténtalo de nuevo.')
      setCode('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <div className="h-16 w-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verificación en dos pasos
          </h1>
          <p className="text-gray-600 text-sm">
            Ingresa el código de 6 dígitos de tu app de autenticación
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input-field text-center text-3xl tracking-[0.5em] font-mono py-4"
                placeholder="000000"
                maxLength={6}
                autoFocus
                required
              />
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full btn-primary disabled:opacity-50 flex items-center justify-center space-x-2 py-3"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <span>Verificar</span>
              )}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            Abre Google Authenticator o Authy para obtener el código
          </p>
        </div>
      </div>
    </div>
  )
}
