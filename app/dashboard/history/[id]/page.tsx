import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ChevronLeft, Calendar, Trash2 } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

// params must be treated as a Promise in Next.js 16
export default async function BillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // 1. Await the params to get the actual ID from the URL
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const supabase = await createClient();
  
  // 2. Fetch data
  const { data: bill, error } = await supabase
    .from('bill_history')
    .select('*')
    .eq('id', id)
    .single();
  
  // 3. If RLS blocks you or ID is wrong, it returns error/null
  if (error || !bill) {
    console.error("Database Error or Row Not Found:", error);
    notFound(); 
  }

  async function deleteBill() {
    'use server'
    const supabase = await createClient();
    await supabase.from('bill_history').delete().eq('id', id);
    revalidatePath('/dashboard/history');
    redirect('/dashboard/history');
  }

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-6 mb-20 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Link href="/dashboard/history" className="flex items-center text-[10px] text-zinc-500 hover:text-white transition-colors uppercase font-black tracking-widest">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to History
        </Link>
        <form action={deleteBill}>
          <button className="text-zinc-800 hover:text-red-500 transition-colors p-2 active:scale-90">
            <Trash2 className="w-5 h-5" />
          </button>
        </form>
      </div>

      <header className="space-y-1">
        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white leading-none">
          {bill.bill_title}
        </h1>
        <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-mono tracking-widest uppercase mt-2">
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
                <TableRow key={i} className="border-white/5 hover:bg-white/[0.01]">
                  <TableCell className="py-6 font-bold text-white px-8">{row.name}</TableCell>
                  <TableCell className="text-right font-mono text-white text-xl px-8">RM{row.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="p-6 border border-white/5 rounded-3xl bg-zinc-950/50">
         <p className="text-[10px] uppercase font-black text-zinc-700 mb-3 tracking-widest">System Reasoning Log</p>
         <div className="text-[10px] font-mono text-zinc-600 whitespace-pre-wrap leading-relaxed italic max-h-60 overflow-y-auto">
            {bill.reasoning_log || "No log recorded for this session."}
         </div>
      </div>
    </div>
  );
}