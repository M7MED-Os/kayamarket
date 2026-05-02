import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateInvoiceHTML } from '@/templates/InvoiceHTML'
import { PlanTier, getDynamicPlanConfigs, getPlanConfig } from '@/lib/subscription'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
  }

  const supabase = await createClient()

  // 1. Fetch Order
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // 2. ✅ Check store plan: hasPdfInvoice
  const { data: storeData } = await supabase
    .from('stores')
    .select('plan')
    .eq('id', order.store_id)
    .single()

  const plan = (storeData?.plan || 'starter') as PlanTier
  const dynamicConfigs = await getDynamicPlanConfigs(supabase)
  const config = dynamicConfigs[plan] || getPlanConfig(plan)

  if (!config.hasPdfInvoice) {
    return NextResponse.json(
      {
        error: 'PLAN_LIMIT',
        message: 'إصدار فواتير PDF متاح فقط في الباقات المدفوعة. يرجى الترقية.',
        plan
      },
      { status: 403 }
    )
  }

  // 3. Fetch Product Description
  let productDescription = ''
  const { data: product } = await supabase
    .from('products')
    .select('description')
    .eq('name', order.product_name)
    .maybeSingle()

  if (product?.description) {
    const words = product.description.split(/\s+/)
    productDescription = words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : '')
  }

  // 4. Fetch Store Settings
  const { data: settings } = await supabase
    .from('store_settings')
    .select('*')
    .eq('store_id', order.store_id)
    .single()

  // 5. Generate HTML
  const html = generateInvoiceHTML(order, productDescription, settings || { cod_enabled: true, cod_deposit_required: false })

  // 6. Generate PDF using Puppeteer
  let browser
  try {
    if (process.env.NODE_ENV === 'production') {
      const puppeteerCore = await import('puppeteer-core')
      const chromium = (await import('@sparticuz/chromium')).default
      browser = await puppeteerCore.default.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
      })
    } else {
      const puppeteer = await import('puppeteer')
      browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })
    }

    const page = await browser.newPage()
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 })
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' },
      displayHeaderFooter: false,
    })

    await browser.close()

    const shortId = order.id.split('-')[0].toUpperCase()
    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Invoice-${shortId}.pdf"`,
      },
    })
  } catch (err: any) {
    if (browser) {
      try { await browser.close() } catch (e) {}
    }
    return NextResponse.json({
      error: 'Failed to generate PDF',
      details: err?.message || err?.toString() || 'Unknown error'
    }, { status: 500 })
  }
}
