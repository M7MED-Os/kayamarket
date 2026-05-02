import { NextRequest, NextResponse } from 'next/server'
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { generateInvoiceHTML } from '@/templates/InvoiceHTML'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = req.nextUrl.searchParams.get('token')

    // Initialize admin client inside handler to avoid build-time env var failures
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log(`[PDF] Generating for ID: ${id}, Token: ${token ? 'YES' : 'NO'}`)

    // 1. Fetch Order Data using Admin Client or RPC
    let order: any = null
    let items: any[] = []
    let storeInfo: any = null
    let branding: any = null
    let settings: any = null

    if (token) {
      // Use the new v2 RPC to get everything
      const { data: rows, error: rpcError } = await supabaseAdmin.rpc('get_order_invoice_v2', {
        p_order_id: id,
        p_token: token,
      })
      
      if (rpcError || !rows || rows.length === 0) {
        console.error('[PDF] RPC Error or no data:', rpcError)
        return NextResponse.json({ error: 'Order not found or access denied' }, { status: 404 })
      }

      const row = rows[0]
      order = row
      items = row.items || []
      storeInfo = { id: row.store_id, name: row.store_name, whatsapp_phone: row.whatsapp }
      branding = { 
        primary_color: row.primary_color, 
        logo_url: row.logo_url,
        invoice_instapay: row.instapay,
        invoice_wallet: row.wallet
      }
      settings = {
        cod_deposit_required: row.cod_deposit_required,
        deposit_percentage: row.deposit_percentage,
        policies: row.policies
      }
    } else {
      // Admin view
      const { data: orderData, error: fetchError } = await supabaseAdmin.from('orders').select('*').eq('id', id).single()
      if (fetchError || !orderData) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      order = orderData

      const { data: itemsData } = await supabaseAdmin.from('order_items').select('*').eq('order_id', id)
      items = itemsData || []

      const storeId = order.store_id
      const { data: s } = await supabaseAdmin.from('stores').select('*').eq('id', storeId).single()
      const { data: b } = await supabaseAdmin.from('store_branding').select('*').eq('store_id', storeId).single()
      const { data: st } = await supabaseAdmin.from('store_settings').select('*').eq('store_id', storeId).single()
      
      storeInfo = s
      branding = b
      settings = st
    }

    // 3. Generate Formal HTML
    const html = generateInvoiceHTML(order, storeInfo || {}, branding || {}, settings || {}, items)

    // 4. Launch Browser to generate PDF
    const isLocal = process.env.NODE_ENV === 'development'
    const executablePath = isLocal 
      ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' 
      : await chromium.executablePath()

    const browser = await puppeteer.launch({
      args: isLocal ? [] : (chromium as any).args,
      defaultViewport: (chromium as any).defaultViewport,
      executablePath,
      headless: isLocal ? true : (chromium as any).headless,
    })

    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
    })

    await browser.close()

    return new NextResponse(pdf as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice-${id.split('-')[0].toUpperCase()}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error('[PDF] Generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
