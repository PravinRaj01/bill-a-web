"use client"
import { Receipt } from "lucide-react"

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#09090b]">
      <div className="relative">
        {/* Pulsing Glow */}
        <div className="absolute -inset-4 bg-white/5 rounded-full blur-2xl animate-pulse" />
        
        {/* Icon */}
        <div className="relative bg-white p-5 rounded-2xl shadow-2xl shadow-white/10">
          <Receipt className="w-10 h-10 text-black" />
        </div>
      </div>
      
      <div className="mt-8 text-center space-y-2">
        <h1 className="text-3xl font-black tracking-tighter text-white">
          Bill.a
        </h1>
        <p className="text-[10px] uppercase tracking-[0.5em] text-slate-500 font-bold">
          The Splitter
        </p>
      </div>

      {/* Subtle Loading bar at the bottom */}
      <div className="absolute bottom-16 w-32 h-[2px] bg-white/5 overflow-hidden rounded-full">
        <div className="w-full h-full bg-white/40 -translate-x-full animate-[loading_1.5s_infinite]" />
      </div>

      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}