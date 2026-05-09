import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

/**
 * 🔒 Rate Limiter Utility
 * Uses Supabase to enforce IP-based rate limiting on sensitive actions.
 * @param actionType The name of the action being limited (e.g., 'create_order', 'login')
 * @param maxRequests Maximum number of allowed requests
 * @param windowSeconds Time window in seconds before the limit resets
 */
export async function checkRateLimit(actionType: string, maxRequests: number, windowSeconds: number): Promise<{ success: boolean; error?: string }> {
  try {
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || 'unknown_ip'
    
    // Bypass if we can't determine IP (e.g. localhost testing without proper headers)
    // But in production, Vercel always provides x-forwarded-for
    if (ip === 'unknown_ip' && process.env.NODE_ENV === 'development') {
      return { success: true }
    }

    const supabase = await createClient()

    const { data: isAllowed, error } = await supabase.rpc('check_ip_rate_limit', {
      p_ip_address: ip,
      p_action_type: actionType,
      p_max_requests: maxRequests,
      p_window_seconds: windowSeconds
    })

    if (error) {
      console.error('Rate limit RPC error:', error)
      // Fail open on DB error so we don't break the app, but log it
      return { success: true }
    }

    if (!isAllowed) {
      return { success: false, error: 'تم تجاوز الحد المسموح. يرجى المحاولة لاحقاً.' }
    }

    return { success: true }
  } catch (error) {
    console.error('Rate limit check exception:', error)
    return { success: true } // Fail open
  }
}
