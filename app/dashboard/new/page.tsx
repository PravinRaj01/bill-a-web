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
  ChevronLeft,
  Image as ImageIcon,
  ScrollText,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Label } from "@/components/ui/label";

interface ReceiptItem { name: string; total_price: number; quantity: number; unit_price: number; }
interface ReceiptData { items: ReceiptItem[]; tax: number; total: number; currency: string; }
interface SplitRecord { name: string; amount: number; items: string; }
type Step = "NAMES" | "SCAN" | "REVIEW" | "SUMMARY";

// Ensure this matches your deployed backend URL (No trailing slash)
const API_URL = "https://favourable-eunice-pravinraj-code-24722b81.koyeb.app";

function BillSplitterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("NAMES");
  const [people, setPeople] = useState<string[]>([]);
  const [newName, setNewName] = useState("");
  const [sessionName, setSessionName] = useState("");
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

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) { setUser(session.user); setIsGuest(false); } 
      else { setIsGuest(true); }
    };
    checkUser();
  }, [supabase]);

  useEffect(() => {
    const namesParam = searchParams.get("names");
    const groupId = searchParams.get("group_id");

    if (namesParam) {
      const loadedNames = decodeURIComponent(namesParam).split(",");
      setPeople(loadedNames);
    } else if (groupId) {
      const loadGroup = async () => {
        const { data } = await supabase.from("saved_groups").select("names, group_name").eq("id", groupId).single();
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
    const isLoadedGroup = !!searchParams.get('group_id');
    if (saveThisGroup && groupName && people.length > 0 && user && !isLoadedGroup) {
      await supabase.from("saved_groups").insert({
        user_id: user.id,
        group_name: groupName,
        names: people,
      });
    }
    setStep("SCAN");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic client-side validation
    if (!file.type.startsWith("image/")) {
        alert("Please upload a valid image file (JPG, PNG).");
        return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout for vision model

    try {
      const res = await fetch(`${API_URL}/scan`, { 
        method: "POST", 
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
          throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();
      
      // Robust check for empty/invalid receipts
      if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
        alert("Could not detect any receipt items. \n\nPlease ensure:\n1. The photo is clear and well-lit\n2. It is a valid receipt (not a random selfie!)\n3. Prices and item names are visible.");
        setLoading(false);
        // Reset inputs to allow immediate retry
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (galleryRef.current) galleryRef.current.value = "";
        return;
      }

      setItems(data);
      setStep("REVIEW");

    } catch (err: any) {
      console.error("Scan Error:", err);
      if (err.name === 'AbortError') {
        alert("Scanning timed out. The server might be waking up (cold start). Please try again in a few seconds.");
      } else {
        alert("Failed to scan receipt. Please check your connection and try again.");
      }
      
      // Reset inputs on error to allow retry
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (galleryRef.current) galleryRef.current.value = "";
    } finally {
        setLoading(false);
    }
  };

  const handleSplit = async () => {
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout

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
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`Server Error: ${res.status}`);

      const data = await res.json();
      
      // --- ROBUST JSON PARSING ---
      const firstBracket = data.result.indexOf('[');
      const lastBracket = data.result.lastIndexOf(']');
      
      if (firstBracket !== -1 && lastBracket !== -1) {
        const jsonString = data.result.substring(firstBracket, lastBracket + 1);
        try {
            const parsedResult = JSON.parse(jsonString);

            if (Array.isArray(parsedResult)) {
                setStructuredSplit(parsedResult);
                setSplitResult(data.result);

                if (user) {
                    let finalTitle = sessionName.trim();
                    if (!finalTitle) {
                        const { data: userBills } = await supabase.from("bill_history").select("id").eq("user_id", user.id);
                        const sessionNum = (userBills?.length || 0) + 1;
                        finalTitle = `Session ${sessionNum}`;
                    }

                    await supabase.from("bill_history").insert({
                        user_id: user.id,
                        bill_title: finalTitle,
                        total_amount: displayedTotal,
                        data: parsedResult,
                        reasoning_log: data.result,
                    });
                }
                setStep("SUMMARY");
            } else {
                throw new Error("AI response was not a list of splits.");
            }
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            throw new Error("Failed to read AI response. Please try splitting again.");
        }
      } else {
        throw new Error("AI did not return a valid split format.");
      }

    } catch (err: any) {
      console.error("Split Error:", err);
      if (err.name === 'AbortError') {
        alert("Split timed out. The server is waking up, please try clicking Split again.");
      } else {
        alert("Split failed. Please ensure your instructions are clear or try again.");
      }
    } finally {
        setLoading(false);
    }
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
            <h2 className="text-xl font-bold tracking-tight text-white italic">Group Setup</h2>
            <p className="text-slate-500 text-xs uppercase tracking-widest font-mono">Step 1 of 3</p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Session Name (Optional)</Label>
            <Input 
                placeholder="e.g. Friday Dinner" 
                className="bg-[#0c0c0e] border-white/5 h-12 rounded-xl text-white font-bold"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
            />
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

              {!isGuest && !searchParams.get('group_id') && (
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
              <h3 className="text-lg font-bold uppercase tracking-tighter text-white">Scan Receipt</h3>
              {/* Added onClick to reset value, allowing re-upload of same file if needed */}
              <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileUpload}
                  onClick={(e: any) => e.target.value = null} 
              />
              <input 
                  type="file" 
                  accept="image/*" 
                  ref={galleryRef} 
                  className="hidden" 
                  onChange={handleFileUpload}
                  onClick={(e: any) => e.target.value = null}
              />
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
                  <div className="space-y-0.5">
                    <div className="text-xs text-white opacity-60 font-mono tracking-tighter uppercase">Apply Tax & Svc</div>
                    <div className="text-[10px] text-zinc-600 font-bold uppercase italic">+{symbol}{items?.tax.toFixed(2)}</div>
                  </div>
                  <Switch checked={includeTax} onCheckedChange={setIncludeTax} disabled={!isCreator} />
                </div>

                <div className="flex justify-between items-center px-2 py-2 border-t border-white/5 pt-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Total to Split</span>
                  <span className="text-xl font-black font-mono italic text-white tracking-tighter">{symbol}{displayedTotal.toFixed(2)}</span>
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
                <button onClick={() => setShowReasoning(!showReasoning)} className="w-full p-4 flex justify-between items-center text-[10px] font-bold text-zinc-500 hover:bg-white/5 transition-colors uppercase tracking-widest">
                  <div className="flex items-center gap-2"><ScrollText size={14} /> System Reasoning Log</div>
                  {showReasoning ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {showReasoning && (
                  <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-200">
                    <div className="p-4 bg-black rounded-xl text-[10px] font-mono text-zinc-500 whitespace-pre-wrap leading-relaxed border border-white/5 max-h-60 overflow-y-auto italic text-left">{splitResult}</div>
                  </div>
                )}
              </div>
              <div className="p-6 space-y-3">
                <Button className="w-full h-12 bg-[#25D366] text-black font-black rounded-xl uppercase tracking-tighter" onClick={() => {
                  let text = `*Bill-a Summary (${symbol})*\n\n`;
                  structuredSplit.forEach((r) => (text += `👤 *${r.name}*: ${symbol}${r.amount.toFixed(2)}\n`));
                  window.open(`whatsapp://send?text=${encodeURIComponent(text)}`);
                }}>
                  <Share2 className="w-4 h-4 mr-2" /> Share via WhatsApp
                </Button>
                <Button variant="outline" className="w-full h-12 border-white/5 text-zinc-500 font-bold rounded-xl uppercase tracking-widest text-[10px]" onClick={() => {
                    router.refresh(); 
                    router.push("/dashboard");
                }}>
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
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-black"><Loader2 className="animate-spin w-8 h-8 text-white opacity-20" /></div>}>
      <BillSplitterContent />
    </Suspense>
  );
}