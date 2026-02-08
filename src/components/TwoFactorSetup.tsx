import { useState } from 'react'
import { Shield, Loader2, Check, AlertCircle, Copy } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface TwoFactorSetupProps {
  onComplete: () => void
  onCancel: () => void
}

export default function TwoFactorSetup({ onComplete, onCancel }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'enroll' | 'verify'>('enroll')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string>('')
  const [secret, setSecret] = useState<string>('')
  const [factorId, setFactorId] = useState<string>('')
  const [verifyCode, setVerifyCode] = useState('')
  const [copied, setCopied] = useState(false)

  const startEnrollment = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'TestimonioYa Authenticator',
      })
      if (error) throw error

      setQrCode(data.totp.qr_code)
      setSecret(data.totp.secret)
      setFactorId(data.id)
      setStep('verify')
    } catch (err: any) {
      setError(err.message || 'Error al configurar 2FA')
    } finally {
      setLoading(false)
    }
  }

  const verifyAndActivate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      })
      if (challengeError) throw challengeError

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: verifyCode,
      })
      if (verifyError) throw verifyError

      onComplete()
    } catch (err: any) {
      setError(err.message || 'Código incorrecto. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const copySecret = () => {
    navigator.clipboard.writeText(secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (step === 'enroll') {
    return (
      <div className="space-y-4">
        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
          <h4 className="font-medium text-indigo-900 mb-2">¿Cómo funciona?</h4>
          <ol className="text-sm text-indigo-800 space-y-1 list-decimal list-inside">
            <li>Descarga Google Authenticator o Authy en tu móvil</li>
            <li>Escanea el código QR que te mostraremos</li>
            <li>Ingresa el código de 6 dígitos para verificar</li>
          </ol>
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={startEnrollment}
            disabled={loading}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
            <span>{loading ? 'Configurando...' : 'Configurar 2FA'}</span>
          </button>
          <button onClick={onCancel} className="btn-secondary">
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-4">
          Escanea este código QR con tu app de autenticación:
        </p>
        {qrCode && (
          <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-xl">
            <img src={qrCode} alt="QR Code para 2FA" className="h-48 w-48" />
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <p className="text-xs text-gray-500 mb-1">¿No puedes escanear? Usa este código:</p>
        <div className="flex items-center space-x-2">
          <code className="flex-1 text-sm font-mono text-gray-800 break-all">{secret}</code>
          <button onClick={copySecret} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <form onSubmit={verifyAndActivate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Código de verificación
          </label>
          <input
            type="text"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="input-field text-center text-2xl tracking-[0.5em] font-mono"
            placeholder="000000"
            maxLength={6}
            autoFocus
            required
          />
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading || verifyCode.length !== 6}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            <span>{loading ? 'Verificando...' : 'Activar 2FA'}</span>
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
