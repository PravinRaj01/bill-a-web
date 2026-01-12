import { createClient } from "@/utils/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Receipt, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function HistoryPage() {
  const supabase = await createClient();
  
  const { data: history } = await supabase
    .from('bill_history')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 mb-20">
      <header className="space-y-1">
        <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white">History</h1>
        <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Past Settlements</p>
      </header>

      <div className="space-y-3">
        {history && history.length > 0 ? (
          history.map((bill) => (
            <Card key={bill.id} className="bg-[#0c0c0e] border-white/5 hover:border-white/10 transition-all rounded-2xl group overflow-hidden shadow-xl">
              <CardContent className="p-0">
                <Link href={`/dashboard/history/${bill.id}`} className="flex items-center p-5 gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/5 group-hover:bg-white/10 transition-colors">
                    <Receipt className="w-5 h-5 text-zinc-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-zinc-100 uppercase tracking-tight truncate">
                      {bill.bill_title || "Untitled Session"}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-mono mt-1 uppercase tracking-widest">
                      <Calendar className="w-3 h-3" />
                      {new Date(bill.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-white text-md">
                      RM{bill.total_amount.toFixed(2)}
                    </div>
                    <div className="text-[9px] text-zinc-700 uppercase font-black flex items-center justify-end gap-1 group-hover:text-white transition-colors">
                      View <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-zinc-900 rounded-3xl">
            <p className="text-zinc-600 font-medium italic">Your history is empty.</p>
          </div>
        )}
      </div>
    </div>
  );
}