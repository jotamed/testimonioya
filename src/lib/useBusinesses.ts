import { useEffect, useState } from 'react'
import { supabase, Business } from './supabase'
import { canCreateBusiness } from './plans'

const CURRENT_BUSINESS_KEY = 'testimonioya_current_business'

export function useBusinesses() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [canCreate, setCanCreate] = useState(false)

  useEffect(() => {
    loadBusinesses()
  }, [])

  const loadBusinesses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Load all businesses for this user
      const { data: businessesData, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (error) throw error

      const bizList = businessesData || []
      setBusinesses(bizList)

      // Determine current business
      if (bizList.length > 0) {
        const savedId = localStorage.getItem(CURRENT_BUSINESS_KEY)
        const savedBiz = bizList.find(b => b.id === savedId)
        
        if (savedBiz) {
          setCurrentBusiness(savedBiz)
        } else {
          // Default to first business
          setCurrentBusiness(bizList[0])
          localStorage.setItem(CURRENT_BUSINESS_KEY, bizList[0].id)
        }

        // Check if user can create more businesses (now based on user's plan, not business)
        const createCheck = await canCreateBusiness(user.id)
        setCanCreate(createCheck.allowed)
      }
    } catch (error) {
      console.error('Error loading businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  const switchBusiness = (businessId: string) => {
    const biz = businesses.find(b => b.id === businessId)
    if (biz) {
      setCurrentBusiness(biz)
      localStorage.setItem(CURRENT_BUSINESS_KEY, businessId)
    }
  }

  const createBusiness = async (businessName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { success: false, error: 'No autenticado' }

      // Check limit (now based on user's plan, not business plan)
      const createCheck = await canCreateBusiness(user.id)
      if (!createCheck.allowed) {
        return { success: false, error: 'Has alcanzado el límite de negocios de tu plan' }
      }

      // Generate slug
      const slug = businessName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        + '-' + Math.random().toString(36).substr(2, 4)

      // Create business (no longer set plan here, it's at user level)
      const { data, error } = await supabase
        .from('businesses')
        .insert({
          user_id: user.id,
          business_name: businessName,
          slug,
        })
        .select()
        .single()

      if (error) throw error

      // Reload and switch to new business
      await loadBusinesses()
      if (data) {
        switchBusiness(data.id)
      }

      return { success: true }
    } catch (error: any) {
      console.error('Error creating business:', error)
      return { success: false, error: error.message || 'Error al crear negocio' }
    }
  }

  return {
    businesses,
    currentBusiness,
    loading,
    canCreate,
    switchBusiness,
    createBusiness,
    reload: loadBusinesses,
  }
}

// DEPRECATED: This function is no longer needed.
// Plan is now stored at user level, not business level.
// Use useUserPlan() hook to get the user's plan.
