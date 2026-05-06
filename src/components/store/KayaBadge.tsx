'use client'

import React from 'react'

export function KayaBadge({ primaryColor, className = "", href = "https://kayamarket.vercel.app" }: { primaryColor?: string; className?: string; href?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      dir="ltr"
      className={`flex items-center gap-0 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/50 shadow-sm transition-all duration-300 group hover:shadow-lg hover:shadow-sky-500/10 hover:ring-2 hover:ring-sky-500/20 hover:scale-105 active:scale-95 select-none ${className}`}
    >
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter opacity-60 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        Powered by
      </span>

      <div className="text-sky-500 shrink-0 transition-transform duration-500 group-hover:rotate-[360deg]">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 shrink-0">
          <path d="M15 50 C15 30.67 30.67 15 50 15 C69.33 15 85 30.67 85 50" stroke="currentColor" strokeWidth="6" strokeLinecap="round"></path>
          <path d="M85 50 C85 69.33 69.33 85 50 85 C30.67 85 15 69.33 15 50" stroke="currentColor" strokeWidth="6" strokeLinecap="round"></path>
          <path d="M30 35 L30 65" stroke="currentColor" strokeWidth="6" strokeLinecap="round"></path>
          <path d="M50 50 L50 70" stroke="currentColor" strokeWidth="6" strokeLinecap="round"></path>
          <path d="M35 30 L50 50 L65 30" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round"></path>
          <path d="M70 35 L70 65" stroke="currentColor" strokeWidth="6" strokeLinecap="round"></path>
        </svg>
      </div>

      <span className="text-sm md:text-base font-black text-sky-500 tracking-tight whitespace-nowrap flex items-center">
        Kaya<span className="font-semibold text-slate-400">Market</span>
      </span>
    </a>
  )
}
