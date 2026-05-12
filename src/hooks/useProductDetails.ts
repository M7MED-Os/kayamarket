'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useProductDetails(id: string) {
  const [product, setProduct] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [ratingSummary, setRatingSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return
      setLoading(true)
      
      // Fetch product
      const { data: productData } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
      
      if (productData) {
        setProduct(productData)
        
        // Fetch approved reviews
        const { data: reviewsData } = await supabase
          .from('product_reviews')
          .select('*')
          .eq('product_id', id)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
        
        setReviews(reviewsData || [])

        // Calculate rating summary
        if (reviewsData && reviewsData.length > 0) {
          const avg = reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length
          setRatingSummary({
            average: avg,
            count: reviewsData.length
          })
        }
      }
      
      setLoading(false)
    }
    fetchProduct()
  }, [id])

  return { product, reviews, ratingSummary, loading }
}
