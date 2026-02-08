import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { isAdminEmail } from '../lib/admin'

interface AdminGuardProps {
  children: React.ReactNode
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/login')
        return
      }
      if (!isAdminEmail(session.user.email)) {
        navigate('/dashboard')
        return
      }
      setAuthorized(true)
      setLoading(false)
    }
    check()
  }, [navigate])

  if (loading && !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <ShieldAlert className="h-10 w-10 text-indigo-600 animate-pulse" />
      </div>
    )
  }

  return <>{children}</>
}
