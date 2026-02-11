import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessageSquare, Check, Mail } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { translateError } from '../lib/errorMessages'

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/onboarding`,
      },
    })
    if (error) setError(translateError(error.message))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
        },
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Error al crear usuario')

      // Check if email confirmation is required
      if (authData.user.identities?.length === 0) {
        throw new Error('Este email ya está registrado. Intenta iniciar sesión.')
      }

      // If email confirmation is needed (session will be null)
      if (!authData.session) {
        setEmailSent(true)
        return
      }

      // If auto-confirmed, redirect to onboarding
      navigate('/onboarding')
    } catch (err: any) {
      setError(translateError(err.message))
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Revisa tu email!
            </h1>
            <p className="text-gray-600 mb-4">
              Hemos enviado un enlace de confirmación a <span className="font-medium">{email}</span>.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Haz clic en el enlace del email para activar tu cuenta y empezar a recolectar testimonios.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6">
              <p className="text-sm text-amber-800">
                ⚠️ <strong>¿No lo ves?</strong> Revisa tu carpeta de <strong>spam</strong> o correo no deseado.
              </p>
            </div>
            <Link
              to="/login"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← Volver a iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <MessageSquare className="h-10 w-10 text-indigo-600" />
            <span className="text-3xl font-bold text-gray-900">TestimonioYa</span>
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Crea tu cuenta gratis
          </h1>
          <p className="text-gray-600">
            Empieza a recolectar testimonios en 30 segundos
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Google Login - Primary CTA */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-gray-200 rounded-xl px-4 py-4 font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all mb-6"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Continuar con Google</span>
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">o con email</span>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Abc123!..."
              />
              <p className="text-xs text-gray-400 mt-1">
                Mín. 6 caracteres con mayúscula, minúscula, número y carácter especial
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta Gratis'}
            </button>
          </form>

          {/* Benefits reminder */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center mb-3">Incluido gratis:</p>
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
              <span className="flex items-center"><Check className="h-3 w-3 text-green-500 mr-1" />10 testimonios/mes</span>
              <span className="flex items-center"><Check className="h-3 w-3 text-green-500 mr-1" />Muro público</span>
              <span className="flex items-center"><Check className="h-3 w-3 text-green-500 mr-1" />QR físico</span>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-gray-500">
            Al crear una cuenta, aceptas nuestros{' '}
            <Link to="/legal/terms" className="text-indigo-600 hover:underline">términos</Link> y{' '}
            <Link to="/legal/privacy" className="text-indigo-600 hover:underline">política de privacidad</Link>
          </p>

          <div className="mt-6 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
