import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { 
  MessageSquare, 
  Link2, 
  BarChart3, 
  Users, 
  Inbox,
  Search,
  FileText,
  PlusCircle
} from 'lucide-react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
  secondaryAction?: {
    label: string
    onClick?: () => void
    href?: string
  }
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      {/* Icon */}
      <div className="flex justify-center mb-4">
        {icon || (
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Inbox className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </div>

      {/* Text */}
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {title}
      </h3>
      <p className="text-gray-500 max-w-sm mx-auto mb-6">
        {description}
      </p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {action && (
            action.href ? (
              <Link
                to={action.href}
                className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                <PlusCircle className="h-4 w-4" />
                <span>{action.label}</span>
              </Link>
            ) : (
              <button
                onClick={action.onClick}
                className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                <PlusCircle className="h-4 w-4" />
                <span>{action.label}</span>
              </button>
            )
          )}
          {secondaryAction && (
            secondaryAction.href ? (
              <Link
                to={secondaryAction.href}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                {secondaryAction.label}
              </Link>
            ) : (
              <button
                onClick={secondaryAction.onClick}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                {secondaryAction.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}

// Pre-configured empty states for common scenarios
export function EmptyTestimonials({ onCreateLink }: { onCreateLink?: () => void }) {
  return (
    <EmptyState
      icon={
        <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center">
          <MessageSquare className="h-8 w-8 text-indigo-600" />
        </div>
      }
      title="No tienes testimonios aún"
      description="Comparte tu enlace NPS con tus clientes para empezar a recibir testimonios."
      action={{
        label: 'Crear enlace',
        onClick: onCreateLink,
        href: onCreateLink ? undefined : '/dashboard/links',
      }}
      secondaryAction={{
        label: 'Ver cómo funciona',
        href: '/#como-funciona',
      }}
    />
  )
}

export function EmptyLinks({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon={
        <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center">
          <Link2 className="h-8 w-8 text-purple-600" />
        </div>
      }
      title="No tienes enlaces de colección"
      description="Crea tu primer enlace para empezar a recopilar testimonios de tus clientes."
      action={{
        label: 'Crear enlace',
        onClick: onCreate,
      }}
    />
  )
}

export function EmptyAnalytics() {
  return (
    <EmptyState
      icon={
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
          <BarChart3 className="h-8 w-8 text-green-600" />
        </div>
      }
      title="No hay datos suficientes"
      description="Necesitas más testimonios para ver las analíticas. Comparte tus enlaces con más clientes."
      action={{
        label: 'Ver enlaces',
        href: '/dashboard/links',
      }}
    />
  )
}

export function EmptyNps() {
  return (
    <EmptyState
      icon={
        <div className="h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center">
          <Users className="h-8 w-8 text-amber-600" />
        </div>
      }
      title="No hay respuestas NPS"
      description="Aún no has recibido respuestas a tus encuestas NPS. Comparte tu enlace NPS con tus clientes."
      action={{
        label: 'Copiar enlace NPS',
        onClick: () => {
          // Will be handled by parent
        },
      }}
    />
  )
}

export function EmptySearch({ query }: { query: string }) {
  return (
    <EmptyState
      icon={
        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
          <Search className="h-8 w-8 text-gray-400" />
        </div>
      }
      title="Sin resultados"
      description={`No se encontraron resultados para "${query}". Intenta con otros términos.`}
    />
  )
}

export function EmptyDetractors() {
  return (
    <EmptyState
      icon={
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-3xl">🎉</span>
        </div>
      }
      title="¡Sin detractores!"
      description="No tienes clientes insatisfechos pendientes de atender. ¡Buen trabajo!"
    />
  )
}

export function EmptyPage() {
  return (
    <EmptyState
      icon={
        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
      }
      title="Página vacía"
      description="No hay contenido para mostrar aquí."
    />
  )
}
