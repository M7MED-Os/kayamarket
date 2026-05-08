'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { generateSlug } from '@/lib/utils/slug'
import { randomUUID } from 'crypto'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // التحقق مما إذا كان الخطأ بسبب عدم تأكيد البريد
    if (error.message.includes('Email not confirmed')) {
      return { 
        error: 'يرجى تأكيد بريدك الإلكتروني أولاً. تحقق من صندوق الوارد.',
        status: 'pending_verification'
      }
    }
    return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }
  }

  // Check roles for redirection
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    const isSuperAdmin = roles?.some(r => r.role === 'super_admin')
    if (isSuperAdmin) {
      redirect('/super-admin')
    }
  }

  redirect('/admin')
}

export async function registerMerchant(formData: FormData) {
  const fullName = formData.get('fullName') as string
  const storeName = formData.get('storeName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const slug = formData.get('slug') as string

  if (!fullName || !storeName || !email || !password || !slug) {
    return { error: 'جميع الحقول مطلوبة' }
  }

  // Validate slug format
  const slugRegex = /^[a-z0-9-]+$/
  if (!slugRegex.test(slug)) {
    return { error: 'رابط المتجر يجب أن يحتوي على حروف إنجليزية صغيرة وأرقام وعلامة (-) فقط' }
  }

  const supabase = await createClient()
  const admin = createAdminClient()

  // 0. التحقق من توفر الـ Slug
  const { data: existingStore } = await admin
    .from('stores')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (existingStore) {
    return { error: 'عذراً، هذا الرابط مستخدم بالفعل. يرجى اختيار رابط آخر.' }
  }

  // 1. محاولة إنشاء حساب (Sign up)
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  const isPending = authData.user && !authData.session
  const userId = authData.user?.id

  if (!userId) return { error: 'فشل إنشاء الحساب' }

  // 2. التحقق مما إذا كان المتجر موجوداً بالفعل لهذا المستخدم
  const { data: existingRole } = await admin
    .from('user_roles')
    .select('store_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (existingRole) {
    return { 
      success: true, 
      status: 'pending_verification',
      message: 'لديك متجر مسجل بالفعل بهذا البريد. يرجى تأكيد حسابك من الرسالة المرسلة لبريدك الإلكتروني.' 
    }
  }

  // 3. إنشاء المتجر والبيانات
  // 3a. إنشاء المتجر
  const { data: store, error: storeError } = await admin
    .from('stores')
    .insert({ name: storeName, slug: slug })
    .select('id')
    .single()

  if (storeError || !store) {
    console.error('Store creation error:', storeError)
    return { error: 'حدث خطأ أثناء إنشاء المتجر' }
  }

  const storeId = store.id

  // 3b. تعيين المالك
  const { error: roleError } = await admin
    .from('user_roles')
    .insert({ user_id: userId, store_id: storeId, role: 'owner' })

  if (roleError) {
    console.error('Role assignment error:', roleError)
    await admin.from('stores').delete().eq('id', storeId)
    return { error: `فشل تعيين الصلاحيات: ${roleError.message}` }
  }

  // 3c. تهيئة الإعدادات
  // جلب الثيم الافتراضي من النظام
  const { data: defaultTheme } = await admin
    .from('platform_themes')
    .select('id')
    .eq('is_default', true)
    .maybeSingle()

  await admin.from('store_settings').insert({ store_id: storeId, cod_enabled: true, cod_deposit_required: false, deposit_percentage: 50 })
  await admin.from('store_branding').insert({ 
    store_id: storeId, 
    primary_color: '#e11d48',
    selected_theme: defaultTheme?.id || 'default'
  })

  if (isPending) {
    return { 
      success: true, 
      status: 'pending_verification',
      message: 'تم إنشاء متجرك بنجاح! يرجى مراجعة بريدك الإلكتروني لتفعيل الحساب والبدء في استخدام لوحة التحكم.'
    }
  }

  redirect('/admin')
}
