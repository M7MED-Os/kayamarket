# 🌸 المراجعة التقنية الشاملة لمشروع متجر الزهور (RIO BOUQUET)

هذا الملف يحتوي على التفاصيل التقنية الدقيقة للمشروع الحالي، ليكون مرجعاً لبناء خطة تحويله إلى منصة متعددة التجار (Multi-Tenant SaaS).

---

## 🛠️ 1. التقنيات المستخدمة (Tech Stack)
- **إطار العمل (Framework):** Next.js 16.2.4 (App Router)
- **اللغة:** TypeScript
- **واجهة المستخدم والتصميم:** React 19.2.4, Tailwind CSS v4, Lucide React (للأيقونات)
- **قاعدة البيانات والاستضافة:** Supabase (PostgreSQL, Storage, Auth)
- **مكتبات مساعدة:** 
  - `react-hook-form` لإدارة النماذج.
  - `react-hot-toast` للإشعارات.
  - `puppeteer` و `@sparticuz/chromium` لتوليد الفواتير بصيغة PDF.

---

## 🗄️ 2. مخطط قاعدة البيانات الحالي (Database Schema)

قاعدة البيانات مبنية على PostgreSQL عبر Supabase، وتحتوي على 4 جداول رئيسية:

### أ. جدول المنتجات (`products`)
- `id` (UUID)
- `name` (TEXT)
- `description` (TEXT)
- `price` (DECIMAL)
- `original_price` (DECIMAL) - لحساب وعرض الخصومات.
- `image_url` (TEXT) - الصورة الرئيسية.
- `images` (TEXT[]) - مصفوفة لصور إضافية للمنتج.
- `category` (TEXT) - تصنيف المنتج (الافتراضي: 'أخرى').
- `views_count` (INTEGER) - عدد المشاهدات.
- `stock` (INTEGER) - المخزون المتوفر.
- `sale_end_date` (TIMESTAMPTZ) - وقت انتهاء الخصم/العرض.
- `is_visible` (BOOLEAN) - حالة إخفاء/إظهار المنتج.

### ب. جدول الطلبات (`orders`)
- `id` (UUID)
- `product_name` (TEXT)
- `product_price` (DECIMAL)
- `coupon_code` (TEXT)
- `discount_percentage` (INTEGER)
- `final_price` (DECIMAL)
- `customer_name` (TEXT)
- `customer_phone` (TEXT)
- `customer_address` (TEXT)
- `payment_method` (TEXT) - طريقة الدفع (مثل: الدفع عند الاستلام).
- `status` (TEXT) - حالة الطلب ('pending', 'confirmed', 'delivered', 'cancelled').

### ج. جدول الكوبونات (`coupons`)
- `code` (TEXT) - كود الخصم (UNIQUE).
- `discount_percentage` (INTEGER)
- `is_active` (BOOLEAN)
- `max_uses` (INTEGER)
- `current_uses` (INTEGER)
- `expires_at` (TIMESTAMPTZ)

### د. جدول إعدادات المتجر (`store_settings`)
*(حالياً جدول بخانة واحدة `id=1` للإعدادات العامة)*
- `cod_enabled` (BOOLEAN) - تفعيل أو تعطيل الدفع عند الاستلام.
- `cod_deposit_required` (BOOLEAN) - فرض دفع عربون عند اختيار الدفع عند الاستلام.
- `deposit_percentage` (INTEGER) - نسبة العربون (مثلاً 50%).
- `policies` (TEXT) - شروط وسياسات المتجر.

### هـ. مساحة التخزين (Storage)
- Bucket باسم `product-images` لتخزين صور المنتجات، بصلاحيات قراءة للعامة وكتابة/حذف للأدمن فقط.

---

## ⚙️ 3. ميزات النظام الحالية (Features)

### واجهة العملاء (Storefront):
- عرض المنتجات بشكل شبكي مع تفاصيل كل منتج (السعر الأساسي، السعر بعد الخصم، مؤقت انتهاء العرض، معرض صور، المخزون المتوفر).
- **نظام الطلب (Checkout):** نموذج لجمع بيانات العميل (الاسم، العنوان، الهاتف) وتطبيق كود خصم، واختيار طريقة الدفع. يتم حفظ الطلب في قاعدة البيانات وتوجيه العميل لصفحة الفاتورة.
- **التوجيه للواتساب:** زر يرسل تفاصيل الطلب أو الفاتورة مباشرة لواتساب التاجر.

### لوحة تحكم الإدارة (`/admin`):
- محمية بنظام مصادقة Supabase (Auth).
- **إدارة المنتجات:** إضافة/تعديل المنتجات مع دعم رفع صور متعددة (`MultiImageUploader`).
- **إدارة الطلبات:** فلترة الطلبات وتغيير حالتها (OrderStatusSelect) وحذفها (DeleteOrderButton).
- **إدارة الكوبونات:** إنشاء أكواد خصم وتحديد عدد مرات الاستخدام وتاريخ الانتهاء.
- **إعدادات المتجر:** واجهة للتحكم في تفعيل/تعطيل "الدفع عند الاستلام"، تحديد نسبة "العربون" المطلوب (Deposit Percentage)، وكتابة سياسات المتجر.

### نظام الفواتير (Invoicing System):
- صفحة ديناميكية لكل فاتورة (`/invoice/[id]`) تعرض تفاصيل الطلب ومبلغ العربون المطلوب بناءً على إعدادات المتجر.
- تصميم الفاتورة يحمل هوية بصرية ثابتة حالياً (اسم "RIO BOUQUET" وصورة لوجو).
- تحتوي الفاتورة على طرق دفع (محفظة، InstaPay) بتصميم يسمح بنسخ النصوص بضغطة زر (`CopyableText`).
- **PDF Generation:** مسار API (`/api/invoice`) يستخدم Puppeteer لتحويل صفحة الفاتورة إلى ملف PDF جاهز للتحميل والطباعة.

---

## 🔒 4. الأمان (Security & RLS)
تم تفعيل Row Level Security (RLS) في Supabase:
- **المنتجات:** قراءة للجميع، كتابة للآدمن فقط (Authenticated).
- **الطلبات:** إدخال للجميع (ليتمكن الزوار من الطلب)، قراءة وكتابة للآدمن فقط.
- **الكوبونات:** قراءة للجميع، كتابة للآدمن فقط.

---

## 🎯 5. ملحوظات مهمة للتطوير المستقبلي (Multi-Tenant)
- التصميم الحالي والاسم (`RIO BOUQUET`) مكتوب بشكل صلب (Hardcoded) في العديد من المكونات (مثل `Layout` والفواتير).
- الإعدادات (`store_settings`) مصممة لمتجر واحد فقط باستخدام الصف رقم `id=1`.
- رفع الصور يتم في مجلد واحد (Bucket) بدون فصل بين صور متاجر مختلفة.
- لا يوجد حالياً نموذج لـ "مستخدمين متعددين بأدوار مختلفة"، الآدمن الحالي هو أي مستخدم (Authenticated) في Supabase.
