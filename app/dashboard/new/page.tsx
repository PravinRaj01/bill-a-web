"use client";
import { useState, useRef, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/utils/supabase/client"; 
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  Plus,
  Receipt,
  Share2,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Image as ImageIcon,
  ScrollText,
} from "lucide-react";

interface ReceiptItem { name: string; total_price: number; quantity: number; unit_price: number; }
interface ReceiptData { items: ReceiptItem[]; tax: number; total: number; currency: string; }
interface SplitRecord { name: string; amount: number; items: string; }
type Step = "NAMES" | "SCAN" | "REVIEW" | "SUMMARY";

const API_URL = "https://dizzy-michele-pravinraj-codes-1a321834.koyeb.app";

function BillSplitterContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); 
  const supabase = createClient();
  
  const [step, setStep] = useState<Step>("NAMES");
  const [people, setPeople] = useState<string[]>([]);
  const [newName, setNewName] = useState("");
  const [items, setItems] = useState<ReceiptData | null>(null);
  const [includeTax, setIncludeTax] = useState(true);
  const [instruction, setInstruction] = useState("");
  const [splitResult, setSplitResult] = useState("");
  const [structuredSplit, setStructuredSplit] = useState<SplitRecord[]>([]);
  const [showReasoning, setShowReasoning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);

  const [saveThisGroup, setSaveThisGroup] = useState(false);
  const [groupName, setGroupName] = useState("");

  const isCreator = true; 
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const subtotal = items?.items.reduce((sum, item) => sum + item.total_price, 0) || 0;
  const displayedTotal = includeTax ? items?.total || 0 : subtotal;

  // Auth Checker
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) { setUser(session.user); setIsGuest(false); } 
      else { setIsGuest(true); }
    };
    checkUser();
  }, [supabase]);

  // Load names if coming from a Saved Group
  useEffect(() => {
    const groupId = searchParams.get('group_id');
    if (groupId) {
      const loadGroup = async () => {
        const { data } = await supabase.from('saved_groups').select('names, group_name').eq('id', groupId).single();
        if (data) {
          setPeople(data.names);
          setGroupName(data.group_name);
        }
      };
      loadGroup();
    }
  }, [searchParams, supabase]);

  const symbol = items?.currency || "RM";

  const addPerson = () => {
    const name = newName.trim();
    if (name && !people.includes(name)) {
      setPeople((prev) => [...prev, name]);
      setNewName("");
    }
  };

  const removePerson = (nameToRemove: string) => {
    setPeople((prev) => prev.filter((p) => p !== nameToRemove));
  };

  const handleStartScanning = async () => {
    if (saveThisGroup && groupName && people.length > 0 && user) {
      await supabase.from('saved_groups').insert({
        user_id: user.id,
        group_name: groupName,
        names: people
      });
    }
    setStep("SCAN");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    try {
      const res = await fetch(`${API_URL}/scan`, { method: "POST", body: formData });
      const data = await res.json();
      if (!data.items || data.items.length === 0) {
        alert("No items detected. Try a clearer photo.");
        setLoading(false);
        return;
      }
      setItems(data);
      setStep("REVIEW");
    } catch (err) {
      alert("Connection error. Try again.");
    }
    setLoading(false);
  };

  const handleSplit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/split`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receipt_data: JSON.stringify(items),
          user_instruction: instruction || "Split equally",
          people_list: people,
          apply_tax: includeTax,
        }),
      });
      
      const data = await res.json();
      const jsonMatch = data.result.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const parsedResult = JSON.parse(jsonMatch[0]);
        setStructuredSplit(parsedResult);
        setSplitResult(data.result);

        if (user) {
          // 1. Get current session count for naming
          const { count } = await supabase
            .from('bill_history')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          
          // 2. Logic: Group Name > Custom Instruction > Session N
          const sessionName = groupName || instruction || `Session ${(count || 0) + 1}`;

          // 3. Insert into DB
          await supabase.from('bill_history').insert({
            user_id: user.id,
            bill_title: sessionName,
            total_amount: displayedTotal,
            data: parsedResult,
            reasoning_log: data.result // Save the log for history retrieval
          });
        }
        setStep("SUMMARY");
      } else {
        alert("Split failed: AI response format invalid.");
      }
    } catch (err) { 
      alert("Split failed: Connection error."); 
    }
    setLoading(false);
  };

  return (
    <main className="flex flex-1 flex-col gap-6 p-6 max-w-xl mx-auto w-full mb-20 animate-in fade-in duration-300">
      {step !== "NAMES" && (
        <Button variant="ghost" className="w-fit p-0 h-auto hover:bg-transparent text-slate-500 font-bold uppercase tracking-widest text-[10px]" onClick={() => setStep("NAMES")}>
          <ChevronLeft size={14} className="mr-1" /> Back
        </Button>
      )}

      {step === "NAMES" && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight">Group Setup</h2>
            <p className="text-slate-500 text-xs uppercase tracking-widest font-mono">Step 1 of 3</p>
          </div>
          <Card className="bg-[#0c0c0e] border-white/5 shadow-2xl rounded-3xl">
            <CardContent className="pt-6 space-y-4">
              <div className="flex gap-2">
                <Input
                  disabled={!isCreator}
                  className="bg-[#141416] border-white/5 focus:ring-1 ring-white/20 h-11 text-white"
                  placeholder="Enter name..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addPerson()}
                />
                <Button onClick={addPerson} disabled={!isCreator || !newName} className="bg-white text-black hover:bg-zinc-200">
                  <Plus size={18} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[44px] p-2 rounded-lg bg-black/20 border border-white/5">
                {people.map((p) => (
                  <Badge key={p} variant="secondary" className="bg-white/5 py-1.5 px-3 flex gap-2 items-center border-none text-slate-300">
                    {p}
                    {isCreator && (
                      <button onClick={() => removePerson(p)} className="hover:bg-white/20 rounded-full p-0.5 transition-colors"><X size={12} /></button>
                    )}
                  </Badge>
                ))}
              </div>

              {!isGuest && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs text-slate-400 font-medium tracking-tight">Save this group?</span>
                    <Switch checked={saveThisGroup} onCheckedChange={setSaveThisGroup} />
                  </div>
                  {saveThisGroup && (
                    <Input 
                      placeholder="Group Name (e.g. Weekend Crew)" 
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="bg-[#141416] border-white/5 h-10 text-xs text-white"
                    />
                  )}
                </div>
              )}

              <Button className="w-full h-12 bg-white text-black font-black uppercase tracking-tighter rounded-xl" disabled={people.length < 1} onClick={handleStartScanning}>
                Start Scanning
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {step === "SCAN" && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <Card className="bg-[#0c0c0e] border-dashed border border-white/10 py-12 rounded-3xl">
            <CardContent className="text-center space-y-6">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                <Receipt className="w-6 h-6 text-white opacity-40" />
              </div>
              <h3 className="text-lg font-bold uppercase tracking-tighter">Scan Receipt</h3>
              <input type="file" accept="image/*" capture="environment" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
              <input type="file" accept="image/*" ref={galleryRef} className="hidden" onChange={handleFileUpload} />
              <div className="flex flex-col gap-2 px-4">
                <Button className="w-full h-14 text-md bg-white text-black font-bold rounded-xl" onClick={() => fileInputRef.current?.click()} disabled={loading || !isCreator}>
                  {loading ? <Loader2 className="animate-spin mr-2" /> : "Snap Photo"}
                </Button>
                <Button variant="ghost" className="text-xs text-slate-500 hover:text-white uppercase font-bold tracking-widest" onClick={() => galleryRef.current?.click()} disabled={loading || !isCreator}>
                  <ImageIcon size={14} className="mr-2" /> Gallery
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {step === "REVIEW" && (
        <div className="space-y-6">
          <Card className="bg-[#0c0c0e] border-white/5 overflow-hidden shadow-2xl rounded-3xl">
            <div className="bg-white/5 p-4 border-b border-white/5 text-[10px] font-bold uppercase text-slate-500 tracking-widest">Extracted Items</div>
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  {items?.items.map((item, i) => (
                    <TableRow key={i} className="border-white/5">
                      <TableCell className="py-4 text-sm font-medium text-zinc-200">{item.name}</TableCell>
                      <TableCell className="text-center text-sm text-slate-500">x{item.quantity}</TableCell>
                      <TableCell className="text-right font-mono text-white">{item.total_price.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-black border border-white/5">
                  <div className="text-xs text-white opacity-60 font-mono tracking-tighter">Apply Tax & Svc ({symbol}{items?.tax.toFixed(2)})</div>
                  <Switch checked={includeTax} onCheckedChange={setIncludeTax} disabled={!isCreator} />
                </div>
                <Input disabled={!isCreator} placeholder="Instructions (e.g. Split equally)" value={instruction} onChange={(e) => setInstruction(e.target.value)} className="bg-black border-white/5 h-12 text-white" />
                <Button className="w-full h-12 bg-white text-black font-black uppercase tracking-tight rounded-xl" onClick={handleSplit} disabled={loading || !isCreator}>
                  {loading ? <Loader2 className="animate-spin" /> : "Split Bill"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {step === "SUMMARY" && (
        <div className="space-y-6 animate-in zoom-in-95 duration-300">
          <Card className="bg-[#0c0c0e] border-white/5 shadow-2xl overflow-hidden ring-1 ring-white/10 rounded-3xl">
            <CardHeader className="text-center border-b border-white/5 py-4 bg-white/[0.02]">
              <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Final Settlement</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  {structuredSplit.map((row, i) => (
                    <TableRow key={i} className="border-white/5">
                      <TableCell className="py-5 font-bold text-sm text-white px-8">{row.name}</TableCell>
                      <TableCell className="text-right font-mono text-white text-xl px-8">{symbol}{row.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="border-t border-white/5">
                <button 
                  onClick={() => setShowReasoning(!showReasoning)}
                  className="w-full p-4 flex justify-between items-center text-[10px] font-bold text-zinc-500 hover:bg-white/5 transition-colors uppercase tracking-widest"
                >
                  <div className="flex items-center gap-2">
                    <ScrollText size={14} />
                    System Reasoning Log
                  </div>
                  {showReasoning ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                
                {showReasoning && (
                  <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-200">
                    <div className="p-4 bg-black rounded-xl text-[10px] font-mono text-zinc-500 whitespace-pre-wrap leading-relaxed border border-white/5 max-h-60 overflow-y-auto italic text-left">
                      {splitResult}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-3">
                <Button className="w-full h-12 bg-[#25D366] text-black font-black rounded-xl uppercase tracking-tighter" onClick={() => {
                  let text = `*Bill-a Summary (${symbol})*\n\n`;
                  structuredSplit.forEach(r => text += `👤 *${r.name}*: ${symbol}${r.amount.toFixed(2)}\n`);
                  window.open(`whatsapp://send?text=${encodeURIComponent(text)}`);
                }}>
                  <Share2 className="w-4 h-4 mr-2" /> Share via WhatsApp
                </Button>
                <Button variant="outline" className="w-full h-12 border-white/5 text-zinc-500 font-bold rounded-xl uppercase tracking-widest text-[10px]" onClick={() => router.push("/dashboard")}>
                  Finish Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}

export default function BillSplitter() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="animate-spin w-8 h-8 text-white opacity-20" />
      </div>
    }>
      <BillSplitterContent />
    </Suspense>
  );
}