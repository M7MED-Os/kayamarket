export function generateInvoiceHTML(order: any, store: any, branding: any, settings: any = { cod_enabled: true, cod_deposit_required: false }, items: any[] = []) {
    const shortId = (order.order_id || order.id || '000000').split('-')[0].toUpperCase()
    const primaryColor = branding?.primary_color || '#e11d48'
    const logoUrl = branding?.logo_url || ''
    const storeName = store?.name || 'متجرنا'
    const tagline = branding?.tagline || 'شكراً لتعاملكم معنا'

    // Payment info
    const instapay = branding?.invoice_instapay || 'غير مسجل'
    const wallet = branding?.invoice_wallet || 'غير مسجل'
    const whatsapp = store?.whatsapp_phone || 'غير مسجل'

    // Calc totals
    const originalPrice = Number(order.product_price || 0)
    const discountPercent = Number(order.discount_percentage || order.discount_pct || 0)
    const discountAmount = (originalPrice * discountPercent) / 100
    const finalPrice = Number(order.final_price || originalPrice)

    // Deposit logic
    const isCOD = order.payment_method === 'الدفع عند الاستلام'
    const isDepositRequired = isCOD && settings?.cod_deposit_required
    const depositPercent = Number(settings?.deposit_percentage || 0)
    const depositAmount = (finalPrice * depositPercent) / 100
    const remainingAmount = finalPrice - depositAmount

    // Dynamic Message Logic
    let statusMessage = ""
    if (!isCOD) {
        statusMessage = `لإتمام الطلب يرجى دفع إجمالي المبلغ (${finalPrice.toFixed(2)} ج.م) وإرسال إيصال الدفع (سكرين شوت) مع هذه الفاتورة على الواتساب للبدء في تجهيز طلبك فوراً.`
    } else if (isDepositRequired) {
        statusMessage = `يرجى دفع مقدم بقيمة ${depositAmount.toFixed(2)} ج.م وإرسال إيصال الدفع مع هذه الفاتورة على الواتساب لتأكيد الحجز والبدء في تجهيز طلبك. الباقي (${remainingAmount.toFixed(2)} ج.م) عند الاستلام.`
    } else {
        statusMessage = `تم تسجيل طلبك بنجاح. يرجى إرسال هذه الفاتورة عبر الواتساب الآن للبدء في تجهيز طلبك وتأكيد موعد التوصيل.`
    }

    // Items table rows
    const itemsRows = items && items.length > 0
        ? items.map(item => `
            <tr>
                <td class="product-name">${item.product_name || item.name}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td class="price-col" style="text-align: left;">
                    <span>${(Number(item.product_price || item.price) * item.quantity).toFixed(2)} ج.م</span>
                </td>
            </tr>
        `).join('')
        : `
            <tr>
                <td class="product-name">${order.product_name}</td>
                <td style="text-align: center;">1</td>
                <td class="price-col" style="text-align: left;">
                    <span>${originalPrice.toFixed(2)} ج.م</span>
                </td>
            </tr>
        `

    return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Cairo', sans-serif; 
            background: white; 
            color: #18181b; 
            padding: 0;
            line-height: 1.5;
        }
        .container { 
            width: 210mm; 
            min-height: 297mm; 
            margin: 0 auto; 
            position: relative;
        }
        
        /* Premium Header with Row Layout */
        .header-banner {
            background-color: ${primaryColor};
            padding: 40px 60px;
            color: white;
            position: relative;
            overflow: hidden;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .shape {
            position: absolute;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20%;
        }
        .shape-1 { width: 150px; height: 150px; top: -50px; left: -50px; transform: rotate(15deg); }
        .shape-2 { width: 100px; height: 100px; bottom: -20px; right: 20%; transform: rotate(-25deg); }
        .shape-3 { width: 60px; height: 60px; top: 20px; right: 10%; transform: rotate(45deg); }

        .header-content { 
            position: relative; 
            z-index: 10; 
            display: flex; 
            align-items: center; 
            gap: 20px; 
        }
        
        .logo-container {
            width: 70px;
            height: 70px;
            background: white;
            border-radius: 18px;
            padding: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        .logo-container img { max-width: 100%; max-height: 100%; border-radius: 10px; }

        .brand-info { display: flex; flex-direction: column; }
        .store-title { font-size: 28px; font-weight: 900; line-height: 1.2; }
        .store-tagline { font-size: 13px; opacity: 0.9; font-weight: 600; margin-top: 2px; }

        .header-meta { text-align: left; position: relative; z-index: 10; }
        .meta-label { font-size: 11px; opacity: 0.8; margin-bottom: 2px; text-transform: uppercase; }
        .meta-value { font-size: 17px; font-weight: 800; }

        .main-content { padding: 40px 60px; }

        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 25px;
            margin-bottom: 35px;
        }

        .info-box {
            background: #f8fafc;
            border: 1.5px solid #f1f5f9;
            border-radius: 24px;
            padding: 24px;
        }

        .box-title {
            color: ${primaryColor};
            font-size: 13px;
            font-weight: 900;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e2e8f0;
        }

        .info-item { margin-bottom: 12px; text-align: right; }
        .info-label { font-size: 10px; color: #94a3b8; font-weight: 700; margin-bottom: 2px; display: block; }
        .info-value { font-size: 14px; font-weight: 800; color: #1e293b; }

        /* Smart Status Alert */
        .alert-box {
            background: #f8fafc;
            border-right: 4px solid ${primaryColor};
            padding: 15px 25px;
            border-radius: 12px;
            margin-bottom: 30px;
            text-align: center;
        }
        .alert-text { font-size: 13px; font-weight: 700; color: ${primaryColor}; line-height: 1.5; }
        
        /* Policies Box */
        .policies-container {
            width: 45%;
            text-align: right;
        }
        .policies-text {
            font-size: 10px;
            color: #64748b;
            line-height: 1.6;
            white-space: pre-line;
            text-align: right;
        }

        /* Table */
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { 
            background: #f8fafc; 
            padding: 15px; 
            font-size: 12px; 
            font-weight: 900; 
            color: #64748b;
            border-bottom: 2px solid #e2e8f0;
            text-align: right;
        }
        td { padding: 20px 15px; border-bottom: 1px solid #f1f5f9; font-weight: 700; text-align: right; }
        .product-name { font-size: 16px; color: #1e293b; }

        /* Totals */
        .totals-section {
            width: 350px;
            margin-top: 0px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            font-weight: 700;
            color: #64748b;
        }
        .total-row.discount { color: #10b981; background: #f0fdf4; padding: 10px; border-radius: 10px; margin: 5px 0; }
        .total-row.grand {
            border-top: 2px solid #e2e8f0;
            margin-top: 10px;
            padding-top: 15px;
            color: ${primaryColor};
            font-size: 22px;
            font-weight: 900;
        }

        /* Deposit Box */
        .deposit-card {
            background: #fffbeb;
            border: 2px dashed #fcd34d;
            border-radius: 16px;
            padding: 22px;
            margin-top: 25px;
        }
        .deposit-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .deposit-label { font-size: 13px; font-weight: 800; color: #92400e; }
        .deposit-value { font-size: 16px; font-weight: 900; color: #92400e; }

        .footer {
            margin-top: 30px;
            text-align: center;
            border-top: 1px solid #f1f5f9;
            padding-top: 20px;
            color: #94a3b8;
        }
        .footer-thanks { font-size: 13px; font-weight: 700; color: #64748b; margin-bottom: 5px; }
        .footer-note { font-size: 10px; opacity: 0.8; }
        
        .discount-label {
            color: #10b981;
            font-size: 12px;
            font-weight: 800;
        }

        .original-price-strikethrough {
            text-decoration: line-through;
            font-size: 15px;
            opacity: 0.4;
            margin-left: 10px;
            font-weight: 600;
            color: #64748b;
        }

        .grand-price {
            font-size: 26px;
            font-weight: 900;
            color: ${primaryColor};
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Premium Header Banner with Logo + Name Row -->
        <header class="header-banner">
            <div class="shape shape-1"></div>
            <div class="shape shape-2"></div>
            <div class="shape shape-3"></div>

            <div class="header-content">
                ${logoUrl ? `
                    <div class="logo-container">
                        <img src="${logoUrl}" alt="logo">
                    </div>
                ` : ''}
                <div class="brand-info">
                    <h1 class="store-title">${storeName}</h1>
                    <p class="store-tagline">${tagline}</p>
                </div>
            </div>

            <div class="header-meta">
                <div style="margin-bottom: 15px;">
                    <p class="meta-label">تاريخ الإصدار</p>
                    <p class="meta-value">${new Date(order.created_at).toLocaleDateString('ar-EG')}</p>
                </div>
                <div>
                    <p class="meta-label">رقم الفاتورة</p>
                    <p class="meta-value">#${shortId}</p>
                </div>
            </div>
        </header>

        <div class="main-content">
            <div class="info-grid">
                <!-- Customer Info -->
                <div class="info-box">
                    <div class="box-title">بيانات العميل</div>
                    <div class="info-item">
                        <span class="info-label">الاسم الكامل</span>
                        <span class="info-value">${order.customer_name || 'عميل غير مسجل'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">رقم الهاتف</span>
                        <span class="info-value" dir="ltr">${order.customer_phone || 'غير مسجل'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">عنوان التوصيل</span>
                        <span class="info-value">${order.customer_address || 'غير مسجل'}</span>
                    </div>
                </div>

                <!-- Payment Info -->
                <div class="info-box">
                    <div class="box-title">بيانات الدفع والتواصل</div>
                    <div class="info-item">
                        <span class="info-label">طريقة الدفع المختارة</span>
                        <span class="info-value">${order.payment_method}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">عنوان InstaPay</span>
                        <span class="info-value" dir="ltr">${instapay}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">رقم المحفظة الإلكترونية</span>
                        <span class="info-value" dir="ltr">${wallet}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">واتساب المتجر</span>
                        <span class="info-value" dir="ltr">${whatsapp}</span>
                    </div>
                </div>
            </div>

            <!-- SMART STATUS ALERT -->
            <div class="alert-box">
                <p class="alert-text">${statusMessage}</p>
            </div>

            <!-- Order Table -->
            <table>
                <thead>
                    <tr>
                        <th style="width: 60%">بيان المنتج</th>
                        <th style="text-align: center;">الكمية</th>
                        <th style="text-align: left;">الإجمالي</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsRows}
                </tbody>
            </table>

            <!-- Summary Footer Row (Policies + Totals) -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 20px; gap: 30px;">
                <!-- Store Policies (Right side in RTL) -->
                <div class="policies-container">
                    ${settings?.policies ? `
                        <div class="box-title" style="margin-bottom: 8px; border-bottom: none; padding-bottom: 0; font-size: 11px;">سياسات المتجر</div>
                        <div class="policies-text">${settings.policies}</div>
                    ` : ''}
                </div>

                <!-- Totals Section (Left side in RTL) -->
                <div class="totals-section">
                    <div class="total-row">
                        <span>المجموع الفرعي:</span>
                        <span>${originalPrice.toFixed(2)} ج.م</span>
                    </div>
                    
                    ${discountPercent > 0 ? `
                        <div class="total-row" style="color: #10b981;">
                            <span class="discount-label">خصم الكوبون (${order.coupon_code || ''}):</span>
                            <span dir="ltr">-${discountAmount.toFixed(2)} ج.م</span>
                        </div>
                    ` : ''}

                    <div class="total-row grand">
                        <span>الإجمالي النهائي:</span>
                        <div style="text-align: left;">
                            <span class="grand-price">${finalPrice.toFixed(2)} ج.م</span>
                        </div>
                    </div>

                    ${isDepositRequired ? `
                        <div class="deposit-card">
                            <div class="deposit-row">
                                <span class="deposit-label">العربون المطلوب (الآن):</span>
                                <span class="deposit-value">${depositAmount.toFixed(2)} ج.م</span>
                            </div>
                            <div class="deposit-row" style="border-top: 1px solid #fde68a; padding-top: 10px; margin-top: 5px;">
                                <span class="deposit-label" style="opacity: 0.8">المتبقي عند الاستلام:</span>
                                <span class="deposit-value" style="opacity: 0.8">${remainingAmount.toFixed(2)} ج.م</span>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>

            <footer class="footer">
                <p class="footer-thanks">شكراً لاختيارك ${storeName}</p>
                <p class="footer-note">هذه الفاتورة موثقة وصادرة إلكترونياً عن طريق متجرنا.</p>
            </footer>
        </div>
    </div>
</body>
</html>
    `
}
