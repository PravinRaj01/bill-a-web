'use client'

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { login, signup } from "@/app/auth/actions" // Import our new actions

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true) // Toggle between Login and Signup
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Wrapper to handle form submission with our server actions
  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    const action = isLogin ? login : signup
    const result = await action(formData)
    
    // If we get an error back (because successful redirect happens automatically)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-950 text-white">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold">
            {isLogin ? "Welcome back" : "Create an account"}
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {isLogin 
              ? "Login with your Apple or Google account" 
              : "Enter your email below to create your account"}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          
          {/* Social Buttons */}
          <div className="grid grid-cols-1 gap-2">
             {/* Apple Button (Visual Only for now) */}
            <Button variant="outline" className="border-zinc-800 bg-zinc-900 text-white hover:bg-zinc-800" disabled>
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-.93 3.69-.93 2.4.25 4.41 1.66 4.96 4.29-4.25 2.12-3.16 9.09 1.27 10.87-.27 1.07-1.16 2.85-2.24 3.99zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Login with Apple
            </Button>

            {/* Google Button - Calls your existing route */}
            <form action="/auth/login-google" method="POST" className="w-full">
              <Button variant="outline" className="w-full border-zinc-800 bg-zinc-900 text-white hover:bg-zinc-800">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor" />
                </svg>
                Login with Google
              </Button>
            </form>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-950 px-2 text-zinc-400">Or continue with</span>
            </div>
          </div>

          {/* Email / Password Form */}
          <form action={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="m@example.com" 
                required 
                className="bg-zinc-900 border-zinc-800"
              />
            </div>
            
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {isLogin && (
                  <Link href="#" className="text-sm text-blue-500 hover:underline">
                    Forgot password?
                  </Link>
                )}
              </div>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="bg-zinc-900 border-zinc-800"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processing..." : (isLogin ? "Login" : "Sign Up")}
            </Button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="text-center text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-blue-500 hover:underline"
            >
              {isLogin ? "Sign up" : "Login"}
            </button>
          </div>

          {/* Guest Link */}
          <div className="relative my-2">
             <div className="relative flex justify-center text-xs uppercase">
               <span className="bg-zinc-950 px-2 text-zinc-500">Guest Access</span>
             </div>
          </div>
          <Button variant="ghost" className="w-full text-zinc-400 hover:text-white" asChild>
            <Link href="/dashboard">Continue as Guest</Link>
          </Button>

        </CardContent>
      </Card>

      {/* Footer Text */}
      <div className="fixed bottom-4 text-center text-xs text-zinc-500 px-4">
        By clicking continue, you agree to our <Link href="#" className="underline">Terms of Service</Link> and <Link href="#" className="underline">Privacy Policy</Link>.
      </div>
    </div>
  )
}