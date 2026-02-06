import { Link } from 'react-router-dom'
import { MessageSquare, Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <Link to="/" className="inline-flex items-center space-x-2 mb-8">
          <MessageSquare className="h-8 w-8 text-indigo-600" />
          <span className="text-2xl font-bold text-gray-900">TestimonioYa</span>
        </Link>

        {/* 404 Illustration */}
        <div className="relative mb-8">
          <div className="text-[150px] font-bold text-indigo-100 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-20 w-20 bg-indigo-600 rounded-full flex items-center justify-center">
              <Search className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Página no encontrada
        </h1>
        <p className="text-gray-600 mb-8">
          Parece que esta página no existe o ha sido movida. 
          Comprueba la URL o vuelve al inicio.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link 
            to="/"
            className="inline-flex items-center justify-center space-x-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Ir al inicio</span>
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver atrás</span>
          </button>
        </div>

        {/* Helpful links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">¿Buscabas alguna de estas páginas?</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700">
              Iniciar sesión
            </Link>
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700">
              Registrarse
            </Link>
            <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-700">
              Dashboard
            </Link>
            <Link to="/#pricing" className="text-indigo-600 hover:text-indigo-700">
              Precios
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
