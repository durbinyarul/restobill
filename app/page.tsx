"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { billStorage, menuStorage, profileStorage, dataStorage } from "@/lib/storage"
import { calculations } from "@/lib/calculations"
import type { Bill, MenuItem } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, DollarSign, FileText, BarChart3, ArrowRight, Receipt, UtensilsCrossed } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const [bills, setBills] = useState<Bill[]>([])
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [profile, setProfile] = useState(profileStorage.get())
  const [stats, setStats] = useState({
    totalSales: 0,
    invoiceCount: 0,
    avgOrderValue: 0,
    todaysSales: 0,
  })

  useEffect(() => {
    dataStorage.initializeData()

    const allBills = billStorage.getAll()
    const allMenu = menuStorage.getAll()
    const restaurantProfile = profileStorage.get()

    setBills(allBills)
    setMenu(allMenu)
    setProfile(restaurantProfile)

    const today = new Date().toISOString().split("T")[0]
    const todaysBills = allBills.filter((b) => b.date === today)
    const todaysSales = todaysBills.reduce((sum, b) => sum + b.finalTotal, 0)
    const totalSales = allBills.reduce((sum, b) => sum + b.finalTotal, 0)

    setStats({
      totalSales,
      invoiceCount: allBills.length,
      avgOrderValue: allBills.length > 0 ? totalSales / allBills.length : 0,
      todaysSales,
    })
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 w-full">
        <header className="sticky top-0 z-30 header-glass">
          <div className="flex items-center justify-between p-4 sm:p-6">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h2>
              <p className="text-sm text-muted-foreground mt-1 truncate">{profile.name}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              {
                title: "Today's Sales",
                value: stats.todaysSales,
                icon: DollarSign,
                subtitle: "Current day",
              },
              {
                title: "Total Sales",
                value: stats.totalSales,
                icon: TrendingUp,
                subtitle: "All time",
              },
              {
                title: "Invoices",
                value: stats.invoiceCount,
                icon: FileText,
                subtitle: "Total bills",
                isCount: true,
              },
              {
                title: "Avg Order Value",
                value: stats.avgOrderValue,
                icon: BarChart3,
                subtitle: "Per order",
              },
            ].map((stat, idx) => {
              const Icon = stat.icon
              return (
                <Card key={idx} className="card-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                    <Icon size={20} className="text-primary opacity-80" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold">
                      {stat.isCount ? stat.value : calculations.formatCurrency(stat.value as number)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Button asChild className="w-full h-11 sm:h-12 font-medium">
                  <Link href="/bills/create" className="flex items-center justify-center gap-2">
                    <FileText size={18} />
                    <span>New Bill</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full h-11 sm:h-12 font-medium bg-transparent">
                  <Link href="/bills" className="flex items-center justify-center gap-2">
                    <Receipt size={18} />
                    <span>All Bills</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full h-11 sm:h-12 font-medium bg-transparent">
                  <Link href="/menu" className="flex items-center justify-center gap-2">
                    <UtensilsCrossed size={18} />
                    <span>Menu</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full h-11 sm:h-12 font-medium bg-transparent">
                  <Link href="/reports" className="flex items-center justify-center gap-2">
                    <BarChart3 size={18} />
                    <span>Reports</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg sm:text-xl">Recent Bills</CardTitle>
              {bills.length > 0 && (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/bills" className="flex items-center gap-1">
                    View All <ArrowRight size={16} />
                  </Link>
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {bills.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <FileText size={32} className="mx-auto text-muted-foreground mb-2 opacity-50" />
                  <p className="text-muted-foreground text-sm sm:text-base">No bills yet. Create one to get started!</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 sm:px-4 font-semibold text-muted-foreground">Invoice</th>
                        <th className="text-left py-3 px-2 sm:px-4 font-semibold text-muted-foreground hidden sm:table-cell">
                          Customer
                        </th>
                        <th className="text-left py-3 px-2 sm:px-4 font-semibold text-muted-foreground hidden md:table-cell">
                          Date
                        </th>
                        <th className="text-right py-3 px-2 sm:px-4 font-semibold text-muted-foreground">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bills
                        .slice(-5)
                        .reverse()
                        .map((bill) => (
                          <tr
                            key={bill.invoiceNo}
                            className="border-b border-border hover:bg-muted/50 transition-colors"
                          >
                            <td className="py-3 px-2 sm:px-4 font-medium text-primary">
                              <Link href={`/bills/${bill.invoiceNo}`} className="hover:underline">
                                {bill.invoiceNo}
                              </Link>
                            </td>
                            <td className="py-3 px-2 sm:px-4 hidden sm:table-cell">{bill.customer.name}</td>
                            <td className="py-3 px-2 sm:px-4 text-muted-foreground hidden md:table-cell text-xs">
                              {calculations.formatDate(bill.date)}
                            </td>
                            <td className="py-3 px-2 sm:px-4 text-right font-semibold">
                              {calculations.formatCurrency(bill.finalTotal)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
