import { createClient } from "@/utils/supabase/server"

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Account</h1>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
        <div>
          <label className="text-sm text-zinc-500">Email Address</label>
          <p className="text-lg">{user?.email}</p>
        </div>
        <div>
          <label className="text-sm text-zinc-500">Account ID</label>
          <p className="text-xs font-mono text-zinc-400">{user?.id}</p>
        </div>
      </div>
    </div>
  )
}