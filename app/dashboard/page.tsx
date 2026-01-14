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
        // Fetch groups ordered by newest first
        const { data } = await supabase
          .from('saved_groups')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        if (data) setGroups(data)
      }
    }
    fetchGroups()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24 md:p-10 max-w-md mx-auto animate-in fade-in">

      <div className="space-y-8">
        {/* New Session Button */}
        <Link href="/dashboard/new" className="block">
          <Button className="w-full h-48 bg-white text-black hover:bg-zinc-200 rounded-[2.5rem] flex flex-col gap-4 group transition-all active:scale-95 shadow-2xl border-0">
            <Plus size={52} strokeWidth={3.5} className="group-hover:scale-110 transition-transform duration-300" />
            <span className="text-2xl font-black uppercase tracking-tighter">New Session</span>
          </Button>
        </Link>

        {/* Instructions */}
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

        {/* Saved Groups */}
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

          {/* GROUPS LIST: Spacing Fixed */}
          <div className="space-y-4">
            {groups.length > 0 ? (
              groups.map((group) => (
                <Link key={group.id} href={`/dashboard/new?group_id=${group.id}`}>
                  <Card className="bg-[#0c0c0e] border border-white/5 hover:border-white/20 transition-all rounded-3xl p-4 group flex items-center justify-between">
                    <div className="flex flex-col gap-1 overflow-hidden mr-4">
                      <h3 className="font-bold text-white uppercase tracking-tight truncate text-sm">{group.group_name}</h3>
                      <p className="text-[10px] text-zinc-500 font-mono uppercase truncate">
                        {group.names.join(", ")}
                      </p>
                    </div>
                    {/* Icon container size increased for better spacing */}
                    <div className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-black transition-colors">
                      <ChevronRight size={16} />
                    </div>
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