import React from 'react'

interface KayaLogoProps {
  className?: string
  iconOnly?: boolean
}

export const KayaLogo = ({ className = "h-9 w-9", iconOnly = false }: KayaLogoProps) => {
  const icon = (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M15 50 C15 30.67 30.67 15 50 15 C69.33 15 85 30.67 85 50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <path d="M85 50 C85 69.33 69.33 85 50 85 C30.67 85 15 69.33 15 50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <path d="M30 35 L30 65" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <path d="M50 50 L50 70" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <path d="M35 30 L50 50 L65 30" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M70 35 L70 65" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )

  if (iconOnly) return icon

  return (
    <div className="flex items-center" dir="ltr">
      <div className="text-sky-500 shrink-0">
        {icon}
      </div>
      <span className="text-xl md:text-2xl font-black text-sky-500 tracking-tight whitespace-nowrap leading-none">
        Kaya<span className="font-normal text-slate-400">Market</span>
      </span>
    </div>
  )
}
