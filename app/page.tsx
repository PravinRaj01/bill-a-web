"use client"
import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, Plus, Users, Receipt, Calculator, Share2, Trash2 } from "lucide-react"




type Step = 'NAMES' | 'SCAN' | 'REVIEW' | 'SUMMARY'

interface ReceiptItem {
  name: string
  quantity: number
  price: number
}

interface ReceiptData {
  items: ReceiptItem[]
  tax: number
  total: number
}

const API_URL = "https://dizzy-michele-pravinraj-codes-1a321834.koyeb.app"

export default function BillSplitter() {
  const [step, setStep] = useState<Step>('NAMES')
  const [people, setPeople] = useState<string[]>([])
  const [newName, setNewName] = useState("")
  const [items, setItems] = useState<ReceiptData | null>(null)
  const [instruction, setInstruction] = useState("")
  const [splitResult, setSplitResult] = useState("")
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Step 1 Functions
  const addPerson = () => {
    if (newName.trim()) {
      setPeople([...people, newName.trim()])
      setNewName("")
    }
  }

  // Step 2 & 3: Scan & Split (Similar to previous, but updating step)
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
          user_instruction: instruction || "Split everything equally",
          people_list: people // Passing our new list of names
        })
      })
      const data = await res.json()
      setSplitResult(data.result)
      setStep('SUMMARY')
    } catch (err) { alert("Split failed") }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">BILL-A</h1>
          <p className="text-slate-500 font-medium italic">Precision AI Bill Splitting</p>
        </div>

        {/* STEP 1: ADD PEOPLE */}
        {step === 'NAMES' && (
          <Card className="shadow-xl border-none ring-1 ring-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5"/> Add Your Group</CardTitle>
              <CardDescription>Who are we splitting with today?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <Input placeholder="Enter name..." value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addPerson()} />
                <Button onClick={addPerson} variant="secondary"><Plus className="w-4 h-4"/></Button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[40px]">
                {people.map((p, i) => (
                  <Badge key={i} variant="outline" className="px-3 py-1 text-sm bg-white gap-2">
                    {p} <Trash2 className="w-3 h-3 cursor-pointer text-slate-400 hover:text-red-500" onClick={() => setPeople(people.filter((_, idx) => idx !== i))}/>
                  </Badge>
                ))}
              </div>
              <Button className="w-full h-12 text-md font-bold" disabled={people.length < 1} onClick={() => setStep('SCAN')}>Next: Scan Receipt</Button>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: SCAN */}
        {step === 'SCAN' && (
          <Card className="shadow-xl border-dashed border-2 border-slate-300">
            <CardContent className="p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                <Receipt className="w-8 h-8 text-slate-600"/>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold">Ready to Scan</h3>
                <p className="text-sm text-slate-500">Capture the receipt for {people.length} people</p>
              </div>
              <input type="file" accept="image/*" capture="environment" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
              <Button className="w-full h-14 text-lg" onClick={() => fileInputRef.current?.click()} disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2"/> : "Snap Photo"}
              </Button>
              <Button variant="ghost" onClick={() => setStep('NAMES')}>Go Back</Button>
            </CardContent>
          </Card>
        )}

        {/* STEP 3: REVIEW */}
        {step === 'REVIEW' && (
          <Card className="shadow-xl overflow-hidden border-none ring-1 ring-slate-200">
             <CardHeader className="bg-slate-900 text-white">
              <CardTitle className="text-lg">Review Items</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="max-h-60 overflow-y-auto rounded-lg border bg-slate-50 p-4 font-mono text-sm">
                {items?.items.map((item: ReceiptItem, i: number) => (
                  <div key={i} className="flex justify-between py-1 border-b border-slate-200 last:border-0">
                    <span>{item.name} x{item.quantity}</span>
                    <span className="font-bold">${item.price.toFixed(2)}</span>
                  </div>
                ))}
                <Separator className="my-2"/>
                <div className="flex justify-between text-slate-500 italic">
                  <span>Detected Tax/Svc</span>
                  <span>${items?.tax.toFixed(2)}</span>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase text-slate-500">Special Instructions</label>
                <Input placeholder="Example: Lim had the pasta, split wine between girls..." value={instruction} onChange={(e) => setInstruction(e.target.value)} className="h-12"/>
                <Button className="w-full h-14 bg-black" onClick={handleSplit} disabled={loading}>
                   {loading ? <Loader2 className="animate-spin mr-2"/> : "Finalize Split ✨"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 4: SUMMARY */}
        {step === 'SUMMARY' && (
          <Card className="shadow-2xl border-none ring-2 ring-black bg-white overflow-hidden">
            <CardHeader className="text-center pb-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Calculator className="w-6 h-6 text-green-600"/>
              </div>
              <CardTitle className="text-2xl font-black">Settlement Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6 text-center">
              <div className="bg-slate-50 p-6 rounded-2xl whitespace-pre-wrap font-medium text-slate-700 leading-relaxed text-left border border-slate-200">
                {splitResult}
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 h-12 bg-green-600 hover:bg-green-700 font-bold" onClick={() => navigator.clipboard.writeText(splitResult)}>
                  <Share2 className="w-4 h-4 mr-2"/> WhatsApp
                </Button>
                <Button variant="outline" className="flex-1 h-12" onClick={() => window.location.reload()}>New Bill</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}