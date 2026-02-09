import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { PlanType } from './plans'

export interface UserProfile {
  id: string
  plan: PlanType
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan_updated_at: string
}

/**
 * Hook to get the current user's subscription plan
 * Plan is now stored at USER level, not business level
 */
export function useUserPlan() {
  const [plan, setPlan] = useState<PlanType>('free')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUserPlan()

    // Subscribe to real-time plan updates
    const channel = supabase
      .channel('user-plan-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          // Only update if it's the current user's profile
          if (payload.new.id === profile?.id) {
            setPlan(payload.new.plan as PlanType)
            setProfile(payload.new as UserProfile)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadUserPlan = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) throw authError
      if (!user) {
        setError('Usuario no autenticado')
        setLoading(false)
        return
      }

      // Get user profile with plan info
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, plan, stripe_customer_id, stripe_subscription_id, plan_updated_at')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      if (profileData) {
        setPlan(profileData.plan as PlanType || 'free')
        setProfile(profileData as UserProfile)
      } else {
        // Fallback to free if no profile found
        setPlan('free')
      }
    } catch (err: any) {
      console.error('Error loading user plan:', err)
      setError(err.message || 'Error al cargar el plan del usuario')
      setPlan('free') // Fallback to free on error
    } finally {
      setLoading(false)
    }
  }

  const refreshPlan = async () => {
    setLoading(true)
    await loadUserPlan()
  }

  return {
    plan,
    profile,
    loading,
    error,
    refreshPlan,
  }
}
