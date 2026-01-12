import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, Calendar, User } from "lucide-react";
import Link from "next/link";

export default async function BillDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  // Fetch specific bill by ID
  const { data: bill } = await supabase
    .from('bill_history')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!bill) {
    notFound();
  }

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-6">
      <Link 
        href="/dashboard/history" 
        className="flex items-center text-sm text-zinc-500 hover:text-white transition-colors w-fit"
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to History
      </Link>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{bill.bill_title}</h1>
        <div className="flex gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(bill.created_at).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {bill.data.length} People
          </span>
        </div>
      </header>

      <Card className="bg-zinc-950 border-zinc-900 shadow-2xl overflow-hidden">
        <CardHeader className="bg-zinc-900/50 border-b border-zinc-800">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-widest">
              Settlement Details
            </CardTitle>
            <div className="text-xl font-black text-white">
              RM{bill.total_amount.toFixed(2)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-900/30">
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-500 text-[10px] uppercase font-bold">Person</TableHead>
                <TableHead className="text-right text-zinc-500 text-[10px] uppercase font-bold">Amount Owed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bill.data.map((row: any, i: number) => (
                <TableRow key={i} className="border-zinc-900 hover:bg-zinc-900/20">
                  <TableCell className="py-4 font-bold text-zinc-200">
                    {row.name}
                  </TableCell>
                  <TableCell className="text-right font-mono text-white text-lg font-medium">
                    RM{row.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <p className="text-center text-[10px] text-zinc-600 italic">
        This record is stored securely in your Bill.a history.
      </p>
    </div>
  );
}