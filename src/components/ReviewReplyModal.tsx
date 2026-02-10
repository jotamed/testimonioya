import { useState } from 'react'
import { X, Sparkles, Star } from 'lucide-react'

interface Review {
  id: string
  business_id: string
  author_name: string
  rating: number
  review_text: string | null
  reply: string | null
  created_at: string
}

interface ReviewReplyModalProps {
  review: Review
  onClose: () => void
  onSave: (reviewId: string, reply: string) => Promise<void>
}

export default function ReviewReplyModal({ review, onClose, onSave }: ReviewReplyModalProps) {
  const [reply, setReply] = useState(review.reply || '')
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)

  const handleSave = async () => {
    if (!reply.trim()) return
    setSaving(true)
    try {
      await onSave(review.id, reply.trim())
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const generateSuggestion = () => {
    setGenerating(true)
    // Placeholder: generate a contextual reply suggestion
    setTimeout(() => {
      const templates: Record<number, string[]> = {
        5: [
          `¡Muchas gracias por tu reseña, ${review.author_name}! Nos alegra mucho que hayas tenido una buena experiencia. ¡Te esperamos pronto!`,
          `¡Gracias, ${review.author_name}! Tu opinión nos motiva a seguir mejorando. ¡Un abrazo!`,
        ],
        4: [
          `Gracias por tu valoración, ${review.author_name}. Nos encanta saber que disfrutaste de tu experiencia. Si hay algo que podamos mejorar, no dudes en contárnoslo.`,
        ],
        3: [
          `Gracias por tu feedback, ${review.author_name}. Tomamos nota de tu experiencia para seguir mejorando. ¿Podrías contarnos qué podríamos hacer mejor?`,
        ],
        2: [
          `Lamentamos que tu experiencia no haya sido la esperada, ${review.author_name}. Nos gustaría saber más para poder mejorar. ¿Podrías contarnos qué ocurrió?`,
        ],
        1: [
          `Sentimos mucho tu mala experiencia, ${review.author_name}. Queremos resolver cualquier problema. ¿Podrías contactarnos directamente para que podamos ayudarte?`,
        ],
      }
      const options = templates[review.rating] || templates[3]
      setReply(options[Math.floor(Math.random() * options.length)])
      setGenerating(false)
    }, 800)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 animate-modal">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Responder reseña</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Original review */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-sm text-gray-900">{review.author_name}</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-3 w-3 ${s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
          </div>
          {review.review_text && (
            <p className="text-sm text-gray-600">{review.review_text}</p>
          )}
        </div>

        {/* Reply */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Tu respuesta</label>
            <button
              onClick={generateSuggestion}
              disabled={generating}
              className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center space-x-1 disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{generating ? 'Generando...' : 'Sugerir respuesta'}</span>
            </button>
          </div>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={4}
            className="input-field resize-none"
            placeholder="Escribe tu respuesta..."
          />
        </div>

        <div className="flex space-x-3">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!reply.trim() || saving}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar respuesta'}
          </button>
        </div>
      </div>
    </div>
  )
}
