'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useStoreBranding(storeId: string) {
  const [branding, setBranding] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchBranding() {
      if (!storeId) {
        setLoading(false)
        return
      }
      setLoading(true)
      const { data } = await supabase
        .from('store_branding')
        .select('*')
        .eq('store_id', storeId)
        .single()
      
      setBranding(data)
      setLoading(false)
    }
    fetchBranding()
  }, [storeId])

  return { branding, loading }
}
