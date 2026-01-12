"use client"
import SplashScreen from "@/components/SplashScreen"
import { useState, useRef, useEffect } from 'react' // ADDED: useEffect
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { 
  Loader2, Plus, Receipt, Share2, 
  X, ChevronDown, ChevronUp, ChevronLeft, Image as ImageIcon 
} from "lucide-react"

interface ReceiptItem { name: string; total_price: number; quantity: number; unit_price: number; }
interface ReceiptData { items: ReceiptItem[]; tax: number; total: number; currency: string; }
interface SplitRecord { name: string; amount: number; items: string; }

type Step = 'NAMES' | 'SCAN' | 'REVIEW' | 'SUMMARY'
const API_URL = "https://dizzy-michele-pravinraj-codes-1a321834.koyeb.app"

export default function BillSplitter() {
  const [step, setStep] = useState<Step>('NAMES')
  const [people, setPeople] = useState<string[]>([])
  const [newName, setNewName] = useState("")
  const [items, setItems] = useState<ReceiptData | null>(null)
  const [includeTax, setIncludeTax] = useState(true)
  const [instruction, setInstruction] = useState("")
  const [splitResult, setSplitResult] = useState("") 
  const [structuredSplit, setStructuredSplit] = useState<SplitRecord[]>([])
  const [showReasoning, setShowReasoning] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // ADDED: Splash Screen State
  const [showSplash, setShowSplash] = useState(true)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  // ADDED: Splash Screen Timer
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500) // Shows for 2.5 seconds
    return () => clearTimeout(timer)
  }, [])

  const symbol = items?.currency || "RM";

  const addPerson = () => {
    const name = newName.trim();
    if (name && !people.includes(name)) {
      setPeople(prev => [...prev, name]);
      setNewName("");
    }
  }

  const removePerson = (nameToRemove: string) => {
    setPeople(prev => prev.filter(p => p !== nameToRemove));
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    setLoading(true)
    const formData = new FormData()
    formData.append("file", e.target.files[0])
    try {
      const res = await fetch(`${API_URL}/scan`, { method: "POST", body: formData })
      setItems(await res.json())
      setStep('REVIEW')
    } catch (err) { alert("Scan failed") }
    setLoading(false)
  }

  const handleSplit = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/split`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receipt_data: JSON.stringify(items),
          user_instruction: instruction || "Split equally",
          people_list: people,
          apply_tax: includeTax
        })
      })
      const data = await res.json()
      try {
        const jsonMatch = data.result.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          setStructuredSplit(JSON.parse(jsonMatch[0]));
        }
      } catch (e) { console.error("Could not parse table data") }
      setSplitResult(data.result)
      setStep('SUMMARY')
    } catch (err) { alert("Split failed") }
    setLoading(false)
  }

  const handleWhatsAppShare = () => {
    let text = `*Bill-a Settlement Summary (${symbol})*\n\n`;
    structuredSplit.forEach(row => {
      text += `👤 *${row.name}*: ${symbol}${row.amount.toFixed(2)}\n`;
    });
    window.open(`whatsapp://send?text=${encodeURIComponent(text)}`);
  }

  // ADDED: Early return for Splash Screen
  if (showSplash) {
    return <SplashScreen />
  }

  return (
    <SidebarProvider>
      <SidebarInset className="bg-[#09090b] text-slate-50 min-h-screen font-sans">
        <header className="flex h-14 shrink-0 items-center justify-between px-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            {step !== 'NAMES' && (
              <button onClick={() => setStep(step === 'SUMMARY' ? 'REVIEW' : step === 'REVIEW' ? 'SCAN' : 'NAMES')} className="mr-2 opacity-50 hover:opacity-100">
                <ChevronLeft size={18}/>
              </button>
            )}
            <div className="bg-white p-1 rounded">
              <Receipt className="w-3 h-3 text-black" />
            </div>
            <span className="text-sm font-bold tracking-tighter ">Bill.a</span>
          </div>
          <Badge variant="outline" className="text-[10px] border-white/10 opacity-50">V1.0</Badge>
        </header>

        <main className="flex flex-1 flex-col gap-6 p-6 max-w-xl mx-auto w-full">
          
          {step === 'NAMES' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight">Group Setup</h2>
                <p className="text-slate-500 text-xs uppercase tracking-widest">Step 1 of 3</p>
              </div>
              <Card className="bg-[#0c0c0e] border-white/5 shadow-2xl">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex gap-2">
                    <Input 
                      className="bg-[#141416] border-white/5 focus:ring-1 ring-white/20 h-11" 
                      placeholder="Enter name..." 
                      value={newName} 
                      onChange={(e) => setNewName(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && addPerson()} 
                    />
                    <Button onClick={addPerson} className="bg-white text-black hover:bg-slate-200"><Plus size={18}/></Button>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[44px] p-2 rounded-lg bg-black/20 border border-white/5">
                    {people.map((p) => (
                      <Badge key={p} variant="secondary" className="bg-white/5 hover:bg-white/10 py-1.5 px-3 flex gap-2 items-center border-none text-slate-300">
                        {p} 
                        <button 
                          onClick={(e) => { e.preventDefault(); removePerson(p); }}
                          className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                        >
                          <X size={12}/>
                        </button>
                      </Badge>
                    ))}
                    {people.length === 0 && <span className="text-slate-600 text-xs flex items-center px-2 italic">No names added yet...</span>}
                  </div>
                  <Button className="w-full h-11 bg-white text-black font-bold text-sm" disabled={people.length < 1} onClick={() => setStep('SCAN')}>
                    Start Scanning
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {step === 'SCAN' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4">
              <Card className="bg-[#0c0c0e] border-dashed border border-white/10 py-12">
                <CardContent className="text-center space-y-6">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                    <Receipt className="w-6 h-6 text-white opacity-40"/>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold">Scan Receipt</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-widest">Analyzing for {people.join(", ")}</p>
                  </div>
                  <input type="file" accept="image/*" capture="environment" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                  <input type="file" accept="image/*" ref={galleryRef} className="hidden" onChange={handleFileUpload} />
                  
                  <div className="flex flex-col gap-2">
                    <Button className="w-full h-14 text-md bg-white text-black font-bold" onClick={() => fileInputRef.current?.click()} disabled={loading}>
                      {loading ? <Loader2 className="animate-spin mr-2"/> : "Snap Photo"}
                    </Button>
                    <Button variant="ghost" className="text-xs text-slate-500 hover:text-white" onClick={() => galleryRef.current?.click()} disabled={loading}>
                      <ImageIcon size={14} className="mr-2"/> Upload from Gallery
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {step === 'REVIEW' && (
            <div className="space-y-6">
              <Card className="bg-[#0c0c0e] border-white/5 overflow-hidden shadow-2xl">
                <div className="bg-white/5 p-4 border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Extracted Items</div>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-white/5">
                      <TableRow className="border-white/5">
                        <TableHead className="text-[10px] uppercase text-slate-500">Item</TableHead>
                        <TableHead className="text-center text-[10px] uppercase text-slate-500">Qty</TableHead>
                        <TableHead className="text-right text-[10px] uppercase text-slate-500">Total ({symbol})</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items?.items.map((item: any, i: number) => (
                        <TableRow key={i} className="border-white/5 hover:bg-white/[0.02]">
                          <TableCell className="py-4 font-medium text-sm">
                            {item.name}
                            <div className="text-[10px] text-slate-500 italic">{symbol}{item.unit_price.toFixed(2)} each</div>
                          </TableCell>
                          <TableCell className="text-center text-sm text-slate-400">x{item.quantity}</TableCell>
                          <TableCell className="text-right font-mono text-white">
                            {item.total_price.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-black border border-white/5">
                      <div className="space-y-0.5">
                        <div className="text-[10px] font-bold uppercase text-slate-500">Apply Tax & Svc</div>
                        <div className="text-xs text-white opacity-60">{symbol}{items?.tax.toFixed(2)} detected</div>
                      </div>
                      <Switch checked={includeTax} onCheckedChange={setIncludeTax} />
                    </div>
                    <div className="space-y-3">
                      <Input 
                        placeholder="Assign items? (e.g. Lim had the burger)" 
                        value={instruction} 
                        onChange={(e) => setInstruction(e.target.value)} 
                        className="bg-black border-white/5 h-12 text-sm" 
                      />
                      <Button className="w-full h-12 bg-white text-black font-bold" onClick={handleSplit} disabled={loading}>
                         {loading ? <Loader2 className="animate-spin mr-2"/> : "Split Bill"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {step === 'SUMMARY' && (
            <div className="space-y-6">
              <Card className="bg-[#0c0c0e] border-white/5 shadow-2xl overflow-hidden ring-1 ring-white/10">
                <CardHeader className="text-center border-b border-white/5 py-4">
                  <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Final Split</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-white/[0.02]">
                      <TableRow className="border-white/5">
                        <TableHead className="text-[10px] uppercase font-bold text-slate-500">Name</TableHead>
                        <TableHead className="text-right text-[10px] uppercase font-bold text-slate-500">Amount ({symbol})</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {structuredSplit.map((row, i) => (
                        <TableRow key={i} className="border-white/5">
                          <TableCell className="py-4 font-bold text-sm">{row.name}</TableCell>
                          <TableCell className="text-right font-mono text-white">{symbol}{row.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="p-6 space-y-4">
                    <div className="border border-white/5 rounded-lg overflow-hidden">
                      <button onClick={() => setShowReasoning(!showReasoning)} className="w-full p-3 flex justify-between items-center text-[10px] font-bold text-slate-500 hover:bg-white/5 transition-colors uppercase">
                        View Math Breakdown {showReasoning ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                      </button>
                      {showReasoning && (
                        <div className="p-4 bg-black text-[10px] font-mono text-slate-500 border-t border-white/5 whitespace-pre-wrap leading-relaxed">
                          {splitResult}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1 h-12 bg-[#25D366] hover:bg-[#20bd5a] text-black font-black" onClick={handleWhatsAppShare}>
                        <Share2 className="w-4 h-4 mr-2"/> Share WhatsApp
                      </Button>
                      <Button variant="outline" className="flex-1 h-12 border-white/5" onClick={() => window.location.reload()}>
                        Reset
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}