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
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">History</h1>
        <p className="text-zinc-400 text-sm">Review your past split sessions.</p>
      </header>

      <div className="space-y-3">
        {history && history.length > 0 ? (
          history.map((bill) => (
            <Card key={bill.id} className="bg-zinc-950 border-zinc-900 hover:border-zinc-700 transition-colors overflow-hidden group">
              <CardContent className="p-0">
                <Link href={`/dashboard/history/${bill.id}`} className="flex items-center p-4 gap-4">
                  <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
                    <Receipt className="w-5 h-5 text-zinc-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-zinc-100 truncate">
                      {bill.bill_title || "Untitled Bill"}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(bill.created_at).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>{bill.data.length} people</span>
                    </div>
                  </div>

                  <div className="text-right pr-2">
                    <div className="font-mono font-bold text-white">
                      RM{bill.total_amount.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-zinc-600 uppercase font-bold tracking-tighter group-hover:text-blue-500 transition-colors flex items-center justify-end gap-1">
                      Details <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-20 text-center border border-dashed border-zinc-800 rounded-2xl">
            <p className="text-zinc-500">No history found. Complete a split to see it here!</p>
          </div>
        )}
      </div>
    </div>
  );
}