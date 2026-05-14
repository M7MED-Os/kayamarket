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
      
      // Fetch product - support both ID (UUID) and Slug
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
      
      let query = supabase.from('products').select('*')
      if (isUUID) {
        query = query.eq('id', id)
      } else {
        // If it's a slug, we normalize it (replace spaces with dashes etc) just in case
        const normalizedSlug = id.includes('%') ? decodeURIComponent(id) : id
        // We also check for the slug version of the input
        query = query.or(`slug.eq."${normalizedSlug}",slug.eq."${normalizedSlug.replace(/\s+/g, '-')}"`)
      }
      
      const { data: productData } = await query.single()
      
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

        // Calculate rating summary - providing multiple keys for compatibility with different themes
        if (reviewsData && reviewsData.length > 0) {
          const avg = reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length
          setRatingSummary({
            average_rating: avg,
            avg: avg,
            total_reviews: reviewsData.length,
            count: reviewsData.length
          })
        } else {
          setRatingSummary({
            average_rating: 5,
            avg: 5,
            total_reviews: 0,
            count: 0
          })
        }
      }
      
      setLoading(false)
    }
    fetchProduct()
  }, [id])

  return { product, reviews, ratingSummary, loading }
}
