import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Zap, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center space-y-8 max-w-3xl mx-auto mb-20">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-balance">Your Modern Dashboard Solution</h1>
          <p className="text-xl text-muted-foreground text-pretty">
            Secure authentication, beautiful interface, and powerful features to manage your business effectively.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" asChild>
              <Link href="/auth/signup">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center space-y-4 p-6 rounded-lg bg-white border">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Secure Authentication</h3>
            <p className="text-muted-foreground">Enterprise-grade security with NextAuth and encrypted data storage.</p>
          </div>

          <div className="text-center space-y-4 p-6 rounded-lg bg-white border">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Lightning Fast</h3>
            <p className="text-muted-foreground">Built with Next.js and optimized for performance and speed.</p>
          </div>

          <div className="text-center space-y-4 p-6 rounded-lg bg-white border">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">User Management</h3>
            <p className="text-muted-foreground">Complete user data management with PostgreSQL database.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
