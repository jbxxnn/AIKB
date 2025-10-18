import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, CreditCard, DollarSign, Users } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
            <p className="text-muted-foreground mt-2">Here's what's happening with your account today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Revenue"
              value="$45,231.89"
              description="Revenue this month"
              icon={DollarSign}
              trend={{ value: 20.1, isPositive: true }}
            />
            <StatCard
              title="Active Users"
              value="+2,350"
              description="Users this month"
              icon={Users}
              trend={{ value: 18.2, isPositive: true }}
            />
            <StatCard
              title="Sales"
              value="+12,234"
              description="Sales this month"
              icon={CreditCard}
              trend={{ value: 12.5, isPositive: true }}
            />
            <StatCard
              title="Active Now"
              value="+573"
              description="Currently active"
              icon={Activity}
              trend={{ value: 8.3, isPositive: true }}
            />
          </div>

          {/* Recent Activity */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recent account activity and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: "New user registered", time: "2 minutes ago" },
                    { action: "Payment received", time: "15 minutes ago" },
                    { action: "New order placed", time: "1 hour ago" },
                    { action: "Profile updated", time: "2 hours ago" },
                    { action: "Settings changed", time: "3 hours ago" },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{item.action}</p>
                        <p className="text-sm text-muted-foreground">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Account Overview</CardTitle>
                <CardDescription>Your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-sm font-semibold">User Name</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm font-semibold">user@example.com</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Account Status</p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <p className="text-sm font-semibold">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
  )
}
