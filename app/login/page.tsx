"use client"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] p-6">
      <Card className="w-full max-w-sm bg-[#0c0c0e] border-white/5">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-white">Welcome to Bill.a</CardTitle>
          <CardDescription className="text-slate-500">
            Login to save your split history
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full border-white/10 hover:bg-white/5 text-white" 
            onClick={handleGoogleLogin}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            Login with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0c0c0e] px-2 text-slate-500">Or continue with guest</span></div>
          </div>

          <Button 
            variant="ghost" 
            className="w-full text-slate-400 hover:text-white"
            onClick={() => window.location.href = "/"}
          >
            Continue as Guest
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}