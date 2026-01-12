import { Plus, Users, ArrowRight } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: groups } = await supabase
    .from('saved_groups')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight text-white italic">Bill.a</h1>
        <p className="text-zinc-500 font-medium tracking-tight">Split bills with AI accuracy.</p>
      </header>

      {/* Main Action - Centered and Big */}
      <Button size="lg" className="w-full h-40 bg-white text-black hover:bg-zinc-200 flex flex-col gap-3 rounded-3xl transition-all shadow-2xl" asChild>
        <Link href="/dashboard/new">
          <Plus className="w-10 h-10" strokeWidth={3} />
          <span className="text-2xl font-black uppercase tracking-tighter">New Session</span>
        </Link>
      </Button>

      {/* Saved Groups Section */}
      <section className="space-y-6 pt-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-200 uppercase tracking-widest text-[12px]">
          <Users className="w-4 h-4 text-zinc-500" />
          Saved Groups
        </h2>
        
        {groups && groups.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groups.map((group) => (
              <Button 
                key={group.id} 
                variant="outline" 
                className="h-auto p-6 justify-between border-white/5 bg-zinc-950 hover:bg-zinc-900 rounded-2xl group transition-all"
                asChild
              >
                <Link href={`/dashboard/new?group_id=${group.id}`}>
                  <div className="text-left space-y-1">
                    <div className="font-bold text-zinc-100 uppercase tracking-tight">{group.group_name}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      {group.names.join(', ')}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-zinc-800 group-hover:text-white transition-all" />
                </Link>
              </Button>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-zinc-900 p-12 text-center">
            <p className="text-zinc-600 text-sm italic font-medium">No saved groups yet.</p>
          </div>
        )}
      </section>
    </div>
  )
}