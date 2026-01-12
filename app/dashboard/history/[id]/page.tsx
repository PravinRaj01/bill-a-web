import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, Calendar, Trash2 } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function BillDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  const { data: bill } = await supabase.from('bill_history').select('*').eq('id', params.id).single();
  if (!bill) notFound();

  // SERVER ACTION TO DELETE
  async function deleteBill() {
    'use server'
    const supabase = await createClient();
    await supabase.from('bill_history').delete().eq('id', params.id);
    revalidatePath('/dashboard/history');
    redirect('/dashboard/history');
  }

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-6 mb-20">
      <div className="flex justify-between items-center">
        <Link href="/dashboard/history" className="flex items-center text-xs text-zinc-500 hover:text-white transition-colors uppercase font-bold tracking-widest">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Link>
        <form action={deleteBill}>
          <button className="text-zinc-600 hover:text-red-500 transition-colors p-2">
            <Trash2 className="w-5 h-5" />
          </button>
        </form>
      </div>

      <header className="space-y-1">
        <h1 className="text-3xl font-black tracking-tighter uppercase">{bill.bill_title}</h1>
        <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase font-mono tracking-widest">
          <Calendar className="w-3 h-3" />
          {new Date(bill.created_at).toLocaleDateString()}
        </div>
      </header>

      <Card className="bg-[#0c0c0e] border-white/5 shadow-2xl overflow-hidden rounded-3xl ring-1 ring-white/10">
        <CardHeader className="text-center border-b border-white/5 py-4 bg-white/[0.02]">
          <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Final Settlement</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableBody>
              {bill.data.map((row: any, i: number) => (
                <TableRow key={i} className="border-white/5">
                  <TableCell className="py-5 font-bold text-white px-8">{row.name}</TableCell>
                  <TableCell className="text-right font-mono text-white text-xl px-8">RM{row.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Math Breakdown in Summary Style */}
      <div className="p-4 border border-white/5 rounded-2xl bg-black/50">
         <p className="text-[10px] uppercase font-bold text-zinc-600 mb-2 tracking-widest">System Reasoning Log</p>
         <div className="text-[10px] font-mono text-zinc-500 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto italic">
            {/* If you didn't save the splitResult in the DB yet, this might be empty for old bills */}
            {bill.reasoning_log || "No log recorded for this session."}
         </div>
      </div>
    </div>
  );
}