import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardNav } from "@/components/dashboard-nav"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session
  try {
    session = await getServerSession(authOptions)
  } catch (error) {
    console.error("[v0] Session error:", error)
    redirect("/auth/signin")
  }

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <SidebarProvider>
      <div className="h-screen w-full bg-[#f3f3f3] border-none shadow-none flex flex-col">
        <div className="sticky top-0 z-50 flex-shrink-0">
          <DashboardNav user={session.user} />
        </div>
        <div className="flex flex-1 w-full overflow-hidden">
          <DashboardSidebar />
          <SidebarInset>
            <main className="flex-1 p-0 overflow-auto border-none shadow-none rounded-none">
              {children}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  )
}
