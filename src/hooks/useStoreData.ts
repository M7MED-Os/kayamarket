'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useStoreData(slug: string) {
  const [store, setStore] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchStore() {
      if (!slug) return
      setLoading(true)
      const { data } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', slug)
        .single()
      
      setStore(data)
      setLoading(false)
    }
    fetchStore()
  }, [slug])

  return { store, loading }
}
