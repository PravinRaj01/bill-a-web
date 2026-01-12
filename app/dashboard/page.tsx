import { Plus, Users, ArrowRight } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: groups } = await supabase
    .from('saved_groups')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight text-white">Dashboard</h1>
        <p className="text-zinc-500 font-medium">Start a new split or manage your groups.</p>
      </header>

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button size="lg" className="h-40 bg-white text-black hover:bg-zinc-200 flex flex-col gap-3 rounded-3xl transition-all" asChild>
          <Link href="/dashboard/new">
            <Plus className="w-8 h-8" strokeWidth={3} />
            <span className="text-xl font-bold uppercase tracking-tight">New Split Session</span>
          </Link>
        </Button>

        <Card className="bg-zinc-900 border-zinc-800 flex items-center p-8 rounded-3xl">
          <div className="space-y-1">
            <h3 className="font-bold text-zinc-100 text-lg">Quick Access</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Scan a receipt and assign items to friends in seconds.
            </p>
          </div>
        </Card>
      </div>

      {/* Saved Groups Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-200">
          <Users className="w-5 h-5 text-zinc-500" />
          Saved Groups
        </h2>
        
        {groups && groups.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groups.map((group) => (
              <Button 
                key={group.id} 
                variant="outline" 
                className="h-auto p-6 justify-between border-zinc-800 bg-zinc-950 hover:bg-zinc-900 rounded-2xl group transition-all"
                asChild
              >
                <Link href={`/dashboard/new?group_id=${group.id}`}>
                  <div className="text-left space-y-1">
                    <div className="font-bold text-zinc-100 uppercase tracking-tight">{group.group_name}</div>
                    <div className="text-xs text-zinc-500 font-mono">
                      {group.names.length} members: {group.names.slice(0, 3).join(', ')}...
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-zinc-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </Link>
              </Button>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-zinc-900 p-16 text-center">
            <Users className="w-10 h-10 text-zinc-800 mx-auto mb-4" />
            <p className="text-zinc-600 font-medium italic">No saved groups yet.</p>
            <p className="text-xs text-zinc-700 mt-2 tracking-wide uppercase">Save a group during your next split!</p>
          </div>
        )}
      </section>
    </div>
  )
}