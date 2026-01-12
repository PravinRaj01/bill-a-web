import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const supabase = await createClient()
  
  // Check if user is already logged in
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-950 text-white shadow-2xl">
        <CardHeader className="text-center pt-8">
          <CardTitle className="text-3xl font-bold tracking-tight">Welcome to Bill.a</CardTitle>
          <CardDescription className="text-zinc-400 mt-2">
            Login to save your split history
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 pb-10 px-8">
          {/* This form posts to our new API route */}
          <form action="/auth/login-google" method="POST">
            <Button 
              type="submit"
              variant="outline" 
              className="flex h-12 w-full gap-3 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-white transition-all"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Login with Google
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="bg-zinc-950 px-3 text-zinc-500 font-medium">Or continue with guest</span>
            </div>
          </div>

          <Button variant="link" className="text-zinc-400 hover:text-white no-underline hover:underline transition-colors" asChild>
            <a href="/dashboard">Continue as Guest</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}