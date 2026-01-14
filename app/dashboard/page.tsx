'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Plus, Users, ChevronRight, Zap, Camera, Share2 } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function DashboardPage() {
  const [groups, setGroups] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchGroups = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('saved_groups').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
        if (data) setGroups(data)
      }
    }
    fetchGroups()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24 md:p-10 max-w-md mx-auto">
      {/* Header - Minimal & Non-Italic */}
      <header className="flex justify-between items-center mb-8 pt-4">
        <h1 className="text-3xl font-black tracking-tighter text-white">Bill.a</h1>
        <div className="px-3 py-1 bg-zinc-900 rounded-full border border-white/5">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">V1.0</span>
        </div>
      </header>

      <div className="space-y-8">
        {/* BIG New Session Button */}
        <Link href="/dashboard/new" className="block">
          <Button className="w-full h-48 bg-white text-black hover:bg-zinc-200 rounded-[2rem] flex flex-col gap-4 group transition-all active:scale-95 shadow-2xl">
            <Plus size={48} strokeWidth={3} className="group-hover:scale-110 transition-transform duration-300" />
            <span className="text-2xl font-black uppercase tracking-tighter">New Session</span>
          </Button>
        </Link>

        {/* Quick Instructions */}
        <section className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6 space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">How it works</h3>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                <Zap size={14} className="text-white" />
              </div>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed pt-1.5">Create a group or pick a saved crew.</p>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                <Camera size={14} className="text-white" />
              </div>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed pt-1.5">Snap a receipt. AI extracts the items.</p>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                <Share2 size={14} className="text-white" />
              </div>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed pt-1.5">Split costs and share via WhatsApp.</p>
            </div>
          </div>
        </section>

        {/* Saved Groups Header */}
        <div>
          <div className="flex justify-between items-end px-2 mb-4">
            <div className="flex items-center gap-2 text-zinc-500">
              <Users size={14} />
              <h2 className="text-[10px] font-black uppercase tracking-widest">Saved Groups</h2>
            </div>
            <Link href="/dashboard/groups" className="text-[10px] font-bold text-zinc-600 hover:text-white transition-colors uppercase tracking-widest">
              Manage
            </Link>
          </div>

          {/* Groups List */}
          <div className="space-y-3">
            {groups.length > 0 ? (
              groups.map((group) => (
                <Link key={group.id} href={`/dashboard/new?group_id=${group.id}`}>
                  <Card className="bg-[#0c0c0e] border-white/5 hover:border-white/10 transition-all rounded-2xl p-5 group flex justify-between items-center">
                    <div className="space-y-1 overflow-hidden">
                      <h3 className="font-bold text-white uppercase tracking-tight truncate">{group.group_name}</h3>
                      <p className="text-[10px] text-zinc-600 font-mono uppercase truncate">
                        {group.names.slice(0, 3).join(", ")}{group.names.length > 3 && "..."}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-zinc-800 group-hover:text-white transition-colors shrink-0 ml-4" />
                  </Card>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 border border-dashed border-white/5 rounded-2xl">
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest">No saved groups</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}