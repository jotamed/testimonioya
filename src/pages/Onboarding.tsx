import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, ArrowRight, ArrowLeft, Check, Copy, Mail, Sparkles, Upload, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { sendWelcomeEmail } from '../lib/email'

const STEPS = [
  { label: 'Tu negocio', number: 1 },
  { label: 'Personaliza', number: 2 },
  { label: 'Tu primer testimonio', number: 3 },
  { label: '¡Listo!', number: 4 },
]

const sectors = [
  { id: 'restaurante', name: 'Restaurante', emoji: '🍽️' },
  { id: 'tienda', name: 'Tienda', emoji: '🛒' },
  { id: 'clinica', name: 'Clínica', emoji: '🏥' },
  { id: 'hotel', name: 'Hotel', emoji: '🏨' },
  { id: 'servicios', name: 'Servicios', emoji: '🔧' },
  { id: 'otro', name: 'Otro', emoji: '✨' },
]

const colorPresets = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#1e293b', // slate
]

const welcomeMessages: Record<string, string> = {
  restaurante: '¡Gracias por visitarnos! Nos encantaría saber qué te pareció.',
  tienda: '¡Gracias por tu compra! Cuéntanos tu experiencia.',
  clinica: 'Gracias por confiar en nosotros. Tu opinión nos ayuda a mejorar.',
  hotel: '¡Gracias por hospedarte con nosotros! ¿Cómo fue tu estancia?',
  servicios: '¡Gracias por trabajar con nosotros! Tu opinión es muy importante.',
  otro: '¡Gracias por tu tiempo! Tu opinión es muy importante para nosotros.',
}

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [animating, setAnimating] = useState(false)

  // Step 1
  const [businessName, setBusinessName] = useState('')
  const [sector, setSector] = useState('')

  // Step 2
  const [logoUrl, setLogoUrl] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [brandColor, setBrandColor] = useState('#6366f1')
  const [description, setDescription] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Step 3+4
  const [shareableLink, setShareableLink] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)
  const [testEmailSent, setTestEmailSent] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/register'); return }
    setUserEmail(user.email || '')
    setCheckingAuth(false)
  }

  const generateSlug = (name: string) =>
    name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const goToStep = (next: number) => {
    setAnimating(true)
    setTimeout(() => {
      setStep(next)
      setAnimating(false)
    }, 200)
  }

  // Save step 1 + 2 data and create business
  const saveBusinessData = async () => {
    setLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No hay sesión activa')

      const slug = generateSlug(businessName) + '-' + Math.random().toString(36).substr(2, 4)
      const welcomeMsg = welcomeMessages[sector] || welcomeMessages.otro

      // Upload logo if selected
      let finalLogoUrl = logoUrl
      if (logoFile) {
        const ext = logoFile.name.split('.').pop()
        const path = `logos/${user.id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('public')
          .upload(path, logoFile)
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('public').getPublicUrl(path)
          finalLogoUrl = urlData.publicUrl
        }
      }

      const { data: businessData, error: bizError } = await supabase
        .from('businesses')
        .insert({
          user_id: user.id,
          business_name: businessName,
          slug,
          plan: 'free',
          industry: sector,
          brand_color: brandColor,
          description: description || null,
          logo_url: finalLogoUrl || null,
          welcome_message: welcomeMsg,
        })
        .select()
        .single()

      if (bizError) throw bizError

      // Create first collection link
      const linkSlug = generateSlug('testimonios') + '-' + Math.random().toString(36).substr(2, 6)
      await supabase.from('collection_links').insert({
        business_id: businessData.id,
        name: 'Testimonios',
        slug: linkSlug,
      })

      const origin = window.location.origin
      setShareableLink(`${origin}/t/${linkSlug}`)

      // Welcome email (non-blocking)
      if (user.email) sendWelcomeEmail(user.email, businessName)

      return true
    } catch (err: any) {
      setError(err.message || 'Error al configurar tu negocio')
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleStep2Next = async () => {
    const ok = await saveBusinessData()
    if (ok) goToStep(3)
  }

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoUrl(URL.createObjectURL(file))
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoUrl('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const copyLink = () => {
    navigator.clipboard.writeText(shareableLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const sendTestEmail = async () => {
    if (!userEmail) return
    setTestEmailSent(true)
    try {
      await supabase.functions.invoke('send-email', {
        body: {
          type: 'request_testimonial',
          to: userEmail,
          business_name: businessName,
          form_url: shareableLink,
          customer_name: userEmail.split('@')[0],
          logo_url: logoUrl || undefined,
        },
      })
    } catch {
      // Non-critical, don't show error
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <MessageSquare className="h-12 w-12 text-indigo-600 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center px-4 py-8 md:py-12">
      {/* Progress Bar */}
      <div className="w-full max-w-lg mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((s) => (
            <div key={s.number} className="flex flex-col items-center flex-1">
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step > s.number
                    ? 'bg-green-500 text-white'
                    : step === s.number
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > s.number ? <Check className="h-5 w-5" /> : s.number}
              </div>
              <span className={`text-xs mt-1 hidden sm:block ${step >= s.number ? 'text-indigo-600 font-medium' : 'text-gray-400'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          {STEPS.map((s) => (
            <div
              key={s.number}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                step >= s.number ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className={`w-full max-w-lg transition-all duration-200 ${animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        {/* Step 1: Tu negocio */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Tu negocio</h2>
            <p className="text-gray-500 mb-6">Cuéntanos lo básico para empezar</p>

            <div className="mb-5">
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del negocio
              </label>
              <input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="input-field text-lg"
                placeholder="Ej: Café La Esquina"
                autoFocus
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Sector / industria</label>
              <div className="grid grid-cols-3 gap-2">
                {sectors.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSector(s.id)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      sector === s.id
                        ? 'border-indigo-600 bg-indigo-50 shadow-sm'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{s.emoji}</span>
                    <span className="text-xs font-medium text-gray-700">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => goToStep(2)}
              disabled={!businessName.trim() || !sector}
              className="w-full btn-primary flex items-center justify-center space-x-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Continuar</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Step 2: Personaliza */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Personaliza</h2>
            <p className="text-gray-500 mb-6">Dale tu estilo a la página de testimonios</p>

            {/* Logo upload */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoSelect}
                className="hidden"
              />
              {logoUrl ? (
                <div className="relative inline-block">
                  <img src={logoUrl} alt="Logo" className="h-20 w-20 rounded-xl object-cover border-2 border-gray-200" />
                  <button
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="h-20 w-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                >
                  <Upload className="h-5 w-5 text-gray-400" />
                  <span className="text-xs text-gray-400 mt-1">Subir</span>
                </button>
              )}
            </div>

            {/* Brand color */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Color de marca</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {colorPresets.map((color) => (
                  <button
                    key={color}
                    onClick={() => setBrandColor(color)}
                    className={`h-9 w-9 rounded-full transition-all ${
                      brandColor === color ? 'ring-2 ring-offset-2 ring-indigo-600 scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <label className="h-9 w-9 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-indigo-400 relative overflow-hidden">
                  <span className="text-xs text-gray-400">+</span>
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </label>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded" style={{ backgroundColor: brandColor }} />
                <span className="text-sm text-gray-500 font-mono">{brandColor}</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción corta <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field resize-none"
                rows={2}
                placeholder="Ej: La mejor pizza artesanal de Madrid"
                maxLength={200}
              />
              <p className="text-xs text-gray-400 text-right mt-1">{description.length}/200</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => goToStep(1)} className="px-4 py-3 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleStep2Next}
                disabled={loading}
                className="flex-1 btn-primary flex items-center justify-center space-x-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Guardando...</span>
                ) : (
                  <>
                    <span>Continuar</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Tu primer testimonio */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Tu primer testimonio</h2>
            <p className="text-gray-500 mb-6">Así verán tus clientes el formulario</p>

            {/* Preview card */}
            <div className="rounded-xl border-2 border-gray-100 p-5 mb-6 bg-gray-50">
              <div className="flex items-center gap-3 mb-4">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: brandColor }}>
                    {businessName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{businessName}</p>
                  {description && <p className="text-xs text-gray-500">{description}</p>}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{welcomeMessages[sector] || welcomeMessages.otro}</p>
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-xl" style={{ color: brandColor }}>★</span>
                ))}
              </div>
              <div className="h-16 rounded-lg border border-gray-200 bg-white flex items-center px-3">
                <span className="text-sm text-gray-400">Escribe tu experiencia...</span>
              </div>
            </div>

            {/* Shareable link */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tu enlace para compartir</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 truncate font-mono">
                  {shareableLink}
                </div>
                <button
                  onClick={copyLink}
                  className="px-3 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-1"
                >
                  {linkCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-500" />}
                  <span className="text-sm">{linkCopied ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Test email */}
            {userEmail && (
              <button
                onClick={sendTestEmail}
                disabled={testEmailSent}
                className={`w-full mb-6 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm transition-colors ${
                  testEmailSent
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:bg-gray-50 text-gray-600'
                }`}
              >
                <Mail className="h-4 w-4" />
                {testEmailSent ? 'Email de prueba enviado ✓' : `Enviar prueba a ${userEmail}`}
              </button>
            )}

            <div className="flex gap-3">
              <button onClick={() => goToStep(2)} className="px-4 py-3 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors" disabled>
                <ArrowLeft className="h-5 w-5 opacity-30" />
              </button>
              <button
                onClick={() => goToStep(4)}
                className="flex-1 btn-primary flex items-center justify-center space-x-2 py-3"
              >
                <span>Continuar</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: ¡Listo! */}
        {step === 4 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200 text-center">
            {/* Celebration animation */}
            <div className="relative mb-6">
              <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-green-100 animate-bounce">
                <Check className="h-12 w-12 text-green-600" />
              </div>
              {/* Confetti dots */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute h-2 w-2 rounded-full animate-ping"
                    style={{
                      backgroundColor: ['#6366f1', '#ec4899', '#22c55e', '#f97316', '#eab308', '#06b6d4'][i % 6],
                      top: `${15 + Math.sin(i * 30 * Math.PI / 180) * 40}%`,
                      left: `${50 + Math.cos(i * 30 * Math.PI / 180) * 40}%`,
                      animationDelay: `${i * 0.15}s`,
                      animationDuration: '1.5s',
                    }}
                  />
                ))}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Tu página de testimonios está lista! 🎉</h2>
            <p className="text-gray-500 mb-6">
              Ya puedes empezar a recolectar testimonios de tus clientes
            </p>

            <div className="bg-gray-50 rounded-lg px-4 py-3 mb-6">
              <p className="text-xs text-gray-400 mb-1">Tu enlace</p>
              <p className="text-sm font-mono text-indigo-600 break-all">{shareableLink}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => { window.location.href = '/dashboard' }}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Ir al dashboard
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareableLink)
                  window.location.href = '/dashboard/request'
                }}
                className="flex-1 btn-primary flex items-center justify-center space-x-2 py-3"
              >
                <Sparkles className="h-5 w-5" />
                <span>Pedir primer testimonio</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
