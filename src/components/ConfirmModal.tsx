import { ReactNode, useState } from 'react'
import { X, AlertTriangle, Trash2, AlertCircle } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string | ReactNode
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  loading?: boolean
  requiresTyping?: string // User must type this to confirm
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  loading = false,
  requiresTyping,
}: ConfirmModalProps) {
  const [typedValue, setTypedValue] = useState('')

  if (!isOpen) return null

  const variants = {
    danger: {
      icon: Trash2,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      buttonBg: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      buttonBg: 'bg-amber-600 hover:bg-amber-700',
    },
    info: {
      icon: AlertCircle,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
    },
  }

  const v = variants[variant]
  const Icon = v.icon
  const canConfirm = !requiresTyping || typedValue === requiresTyping

  const handleConfirm = () => {
    if (canConfirm) {
      onConfirm()
      setTypedValue('')
    }
  }

  const handleClose = () => {
    setTypedValue('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-modal-in"
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Icon */}
          <div className={`h-12 w-12 rounded-full ${v.iconBg} flex items-center justify-center mx-auto mb-4`}>
            <Icon className={`h-6 w-6 ${v.iconColor}`} />
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
            {title}
          </h3>

          {/* Message */}
          <div className="text-gray-600 text-center mb-6">
            {message}
          </div>

          {/* Typing confirmation */}
          {requiresTyping && (
            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-2">
                Escribe <span className="font-mono font-bold text-gray-900">{requiresTyping}</span> para confirmar:
              </label>
              <input
                type="text"
                value={typedValue}
                onChange={(e) => setTypedValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder={requiresTyping}
                autoComplete="off"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || !canConfirm}
              className={`flex-1 px-4 py-2.5 rounded-lg text-white font-medium ${v.buttonBg} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? 'Procesando...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook for easier usage - can be expanded later
export function useConfirm() {
  const [state, setState] = useState<{
    isOpen: boolean
    resolve: ((value: boolean) => void) | null
  }>({
    isOpen: false,
    resolve: null,
  })

  const confirm = () => {
    return new Promise<boolean>((resolve) => {
      setState({ isOpen: true, resolve })
    })
  }

  const handleClose = () => {
    state.resolve?.(false)
    setState({ isOpen: false, resolve: null })
  }

  const handleConfirm = () => {
    state.resolve?.(true)
    setState({ isOpen: false, resolve: null })
  }

  return {
    isOpen: state.isOpen,
    confirm,
    onClose: handleClose,
    onConfirm: handleConfirm,
  }
}
