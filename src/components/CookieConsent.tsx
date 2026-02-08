import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'

const COOKIE_CONSENT_KEY = 'testimonioya_cookie_consent'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const accept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 pointer-events-none">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 pointer-events-auto animate-slide-up">
        <div className="flex items-start space-x-4">
          <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-lg">🍪</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700 leading-relaxed">
              Usamos cookies para mejorar tu experiencia. Al continuar, aceptas nuestra{' '}
              <Link to="/legal/cookies" className="text-indigo-600 hover:text-indigo-700 font-medium underline underline-offset-2">
                política de cookies
              </Link>.
            </p>
            <div className="flex items-center space-x-3 mt-4">
              <button
                onClick={accept}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Aceptar
              </button>
              <Link
                to="/legal/cookies"
                className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Ver política
              </Link>
            </div>
          </div>
          <button
            onClick={accept}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
