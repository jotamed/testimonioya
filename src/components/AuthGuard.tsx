import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface AuthGuardProps {
  children: React.ReactNode
  requireBusiness?: boolean
}

export default function AuthGuard({ children, requireBusiness = true }: AuthGuardProps) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/login')
        return
      }

      // Check if user has at least one business (if required)
      if (requireBusiness) {
        const { data: businesses } = await supabase
          .from('businesses')
          .select('id')
          .eq('user_id', session.user.id)
          .limit(1)

        if (!businesses || businesses.length === 0) {
          navigate('/onboarding')
          return
        }
      }

      setAuthenticated(true)
      setLoading(false)
    }
    check()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate, requireBusiness])

  if (loading && !authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <MessageSquare className="h-10 w-10 text-indigo-600 animate-pulse" />
      </div>
    )
  }

  return <>{children}</>
}
