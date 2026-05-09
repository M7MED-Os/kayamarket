'use client'

import { useState } from 'react'
import {
  Settings, Shield, Zap, Star, TrendingUp, Check, X,
  Layers, Save, Loader2, DollarSign, Ticket
} from 'lucide-react'
import { PlanTier, PlanLimits } from '@/lib/subscription'
import { updatePlanConfig } from '@/app/actions/super-admin'
import toast from 'react-hot-toast'

interface PlanEditorProps {
  initialConfigs: Record<PlanTier, PlanLimits & { priceMonthly?: number }>
}

export default function PlanEditor({ initialConfigs }: PlanEditorProps) {
  const [configs, setConfigs] = useState(initialConfigs)
  const [loadingTier, setLoadingTier] = useState<string | null>(null)

  const tiers: PlanTier[] = ['starter', 'growth', 'pro']

  const handleUpdate = async (tier: PlanTier) => {
    setLoadingTier(tier)
    const res = await updatePlanConfig(tier, {
      ...configs[tier],
      priceMonthly: configs[tier].priceMonthly || 0
    })
    if (res.success) {
      toast.success(`تم تحديث باقة ${configs[tier].name} بنجاح`)
    } else {
      toast.error(res.error || 'فشل التحديث')
    }
    setLoadingTier(null)
  }

  const toggleFeature = (tier: PlanTier, feature: keyof PlanLimits) => {
    setConfigs(prev => ({
      ...prev,
      [tier]: { ...prev[tier], [feature]: !prev[tier][feature] }
    }))
  }

  const updateLimit = (tier: PlanTier, limit: keyof PlanLimits, value: number) => {
    setConfigs(prev => ({
      ...prev,
      [tier]: { ...prev[tier], [limit]: value }
    }))
  }

  const updatePrice = (tier: PlanTier, value: number) => {
    setConfigs(prev => ({
      ...prev,
      [tier]: { ...prev[tier], priceMonthly: value }
    }))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {tiers.map((tier) => {
        const config = configs[tier]
        const isStarter = tier === 'starter'
        const isGrowth = tier === 'growth'
        const isPro = tier === 'pro'
        const isLoading = loadingTier === tier

        return (
          <div key={tier} className={`bg-white border-2 ${isPro ? 'border-amber-100' : isGrowth ? 'border-indigo-100' : 'border-slate-100'} rounded-[2.5rem] p-8 shadow-sm flex flex-col h-full relative overflow-hidden transition-all hover:shadow-md`}>
            {isPro && <div className="absolute top-0 right-0 h-1.5 w-full bg-amber-500" />}
            {isGrowth && <div className="absolute top-0 right-0 h-1.5 w-full bg-indigo-500" />}

            {/* Plan Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${isPro ? 'bg-amber-50 text-amber-600' : isGrowth ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                {isPro ? <Zap className="h-7 w-7" /> : isGrowth ? <TrendingUp className="h-7 w-7" /> : <Star className="h-7 w-7" />}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">{config.name}</h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">ID: {tier}</span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">السعر الشهري (ج.م)</label>
              <div className="relative">
                <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number" min={0}
                  value={config.priceMonthly || 0}
                  onChange={(e) => updatePrice(tier, Number(e.target.value))}
                  className="w-full h-12 bg-slate-50 border-none rounded-xl pr-10 text-sm font-black focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="space-y-6 flex-1">
              {/* Numeric Limits */}
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Layers className="h-3 w-3" /> الحدود الرقمية
                </h4>
                <div className="space-y-4">
                  {/* Max Products */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 mb-1 block">أقصى عدد منتجات</span>
                    <input type="number" min={1}
                      value={config.maxProducts}
                      onChange={(e) => updateLimit(tier, 'maxProducts', Number(e.target.value))}
                      className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-slate-400"
                    />
                  </div>
                  {/* Max Images */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 mb-1 block">أقصى عدد صور للمنتج</span>
                    <input type="number" min={1}
                      value={config.maxImagesPerProduct}
                      onChange={(e) => updateLimit(tier, 'maxImagesPerProduct', Number(e.target.value))}
                      className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-slate-400"
                    />
                  </div>
                  {/* Max Coupons (0 = disabled) */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 mb-1 block flex items-center gap-1">
                      <Ticket className="h-3 w-3" />
                      أقصى عدد كوبونات <span className="text-slate-400 font-normal">(0 = معطل)</span>
                    </span>
                    <input type="number" min={0}
                      value={config.maxCoupons ?? 0}
                      onChange={(e) => updateLimit(tier, 'maxCoupons', Number(e.target.value))}
                      className={`w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-slate-400 ${(config.maxCoupons ?? 0) === 0 ? 'text-rose-400' : 'text-emerald-600'}`}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      {(config.maxCoupons ?? 0) === 0 ? '🔴 الكوبونات معطلة لهذه الباقة' : `🟢 يُسمح بـ ${config.maxCoupons} كوبون`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature Toggles */}
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Shield className="h-3 w-3" /> تفعيل الميزات
                </h4>
                <div className="space-y-3">
                  <FeatureToggle label="إصدار فواتير PDF"      enabled={config.hasPdfInvoice}        onToggle={() => toggleFeature(tier, 'hasPdfInvoice')} />
                  <FeatureToggle label="تخصيص الهوية البصرية"  enabled={config.hasCustomBranding}    onToggle={() => toggleFeature(tier, 'hasCustomBranding')} />
                  <FeatureToggle label="صورة واجهة احترافية"    enabled={config.hasHeroImage}          onToggle={() => toggleFeature(tier, 'hasHeroImage')} />
                  <FeatureToggle label="دومين مخصص"            enabled={config.hasCustomDomain}      onToggle={() => toggleFeature(tier, 'hasCustomDomain')} />
                  <FeatureToggle label="تحليلات متقدمة"        enabled={config.hasAdvancedAnalytics} onToggle={() => toggleFeature(tier, 'hasAdvancedAnalytics')} />
                  <FeatureToggle label="إزالة شعار المنصة"     enabled={config.canRemoveWatermark}   onToggle={() => toggleFeature(tier, 'canRemoveWatermark')} />
                  <FeatureToggle label="ربط واتساب احترافي"    enabled={config.hasProfessionalWhatsapp} onToggle={() => toggleFeature(tier, 'hasProfessionalWhatsapp')} />
                </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-50">
              <button
                onClick={() => handleUpdate(tier)}
                disabled={isLoading}
                className={`w-full h-14 rounded-2xl ${isPro ? 'bg-amber-600' : isGrowth ? 'bg-indigo-600' : 'bg-slate-900'} text-white font-black text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50`}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-4 w-4" /> حفظ التعديلات</>}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function FeatureToggle({ label, enabled, onToggle }: { label: string, enabled: boolean, onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center justify-between w-full p-3 rounded-xl border transition-all ${enabled ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}
    >
      <span className={`text-xs font-black ${enabled ? 'text-emerald-700' : 'text-slate-500'}`}>{label}</span>
      {enabled ? (
        <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
          <Check className="h-3 w-3" />
        </div>
      ) : (
        <div className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
          <X className="h-3 w-3" />
        </div>
      )}
    </button>
  )
}
