"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { billStorage, type Bill } from "@/lib/storage"
import { calculations } from "@/lib/calculations"
import { generateMISExcel } from "@/lib/excel-utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, TrendingUp, AlertCircle } from "lucide-react"

export default function ReportsPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [filteredBills, setFilteredBills] = useState<Bill[]>([])
  const [startDate, setStartDate] = useState(() => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    return firstDay.toISOString().split("T")[0]
  })
  const [endDate, setEndDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  })
  const [misData, setMisData] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const allBills = billStorage.getAll()
    console.log("[v0] Bills loaded from storage:", allBills.length, allBills)
    setBills(allBills)
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    const startDateStr = firstDay.toISOString().split("T")[0]
    const endDateStr = today.toISOString().split("T")[0]

    const currentMonthBills = allBills.filter((b) => b.date >= startDateStr && b.date <= endDateStr)
    setFilteredBills(currentMonthBills)
    generateReport(currentMonthBills)
  }, [])

  useEffect(() => {
    let filtered = bills
    if (startDate) filtered = filtered.filter((b) => b.date >= startDate)
    if (endDate) filtered = filtered.filter((b) => b.date <= endDate)
    console.log("[v0] Filtered bills:", filtered.length, "with dates", startDate, "to", endDate)
    setFilteredBills(filtered)
    generateReport(filtered)
  }, [startDate, endDate, bills])

  const generateReport = (reportBills: Bill[]) => {
    console.log("[v0] Generating report for", reportBills.length, "bills")
    if (reportBills.length === 0) {
      console.log("[v0] No bills to report")
      setMisData({
        totalSales: 0,
        totalTax: 0,
        invoiceCount: 0,
        averageOrderValue: 0,
        top5Items: [],
        dailySales: {},
        itemSales: {},
      })
    } else {
      const report = calculations.generateMISReport(reportBills)
      console.log("[v0] Report generated:", report)
      setMisData(report)
    }
  }

  const handleDownloadExcel = async () => {
    if (!misData || filteredBills.length === 0) {
      alert("No data to export")
      return
    }
    setIsGenerating(true)
    try {
      await generateMISExcel(misData, `MIS-Report-${new Date().toISOString().split("T")[0]}.xlsx`)
    } catch (error) {
      console.error("[v0] Error generating Excel:", error)
      alert("Error generating Excel")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-card/50 backdrop-blur-md">
          <div className="flex items-center justify-between p-4 lg:pl-6 lg:pr-8">
            <h2 className="text-2xl font-bold">MIS Report</h2>
            <ThemeToggle />
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-8 space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Report Period</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {bills.length === 0 && (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
              <CardContent className="pt-6 flex items-start gap-3">
                <AlertCircle className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-semibold text-amber-900 dark:text-amber-100">No sales data yet</p>
                  <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                    Create bills to see sales reports here.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {misData && (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{calculations.formatCurrency(misData.totalSales)}</p>
                    <p className="text-xs text-muted-foreground mt-1">from {misData.invoiceCount} invoices</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Total Tax</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{calculations.formatCurrency(misData.totalTax)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {misData.totalSales > 0 ? ((misData.totalTax / misData.totalSales) * 100).toFixed(1) : 0}% of
                      sales
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">No. of Invoices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{misData.invoiceCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">total bills created</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{calculations.formatCurrency(misData.averageOrderValue)}</p>
                    <p className="text-xs text-muted-foreground mt-1">per bill</p>
                  </CardContent>
                </Card>
              </div>

              {/* Top Items */}
              {misData.top5Items.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp size={20} />
                      Top 5 Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4">Item Name</th>
                            <th className="text-right py-3 px-4">Quantity Sold</th>
                            <th className="text-right py-3 px-4">Total Sales</th>
                          </tr>
                        </thead>
                        <tbody>
                          {misData.top5Items.map((item: any, idx: number) => (
                            <tr key={idx} className="border-b border-border hover:bg-muted/50">
                              <td className="py-3 px-4">{item.name}</td>
                              <td className="text-right py-3 px-4">{item.count}</td>
                              <td className="text-right py-3 px-4">{calculations.formatCurrency(item.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Daily Sales */}
              {Object.keys(misData.dailySales).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Sales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4">Date</th>
                            <th className="text-right py-3 px-4">Sales Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(misData.dailySales)
                            .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
                            .map(([date, total]: [string, any]) => (
                              <tr key={date} className="border-b border-border hover:bg-muted/50">
                                <td className="py-3 px-4">{calculations.formatDate(date)}</td>
                                <td className="text-right py-3 px-4">{calculations.formatCurrency(total)}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Export Button */}
              <div className="flex gap-4">
                <Button
                  onClick={handleDownloadExcel}
                  disabled={isGenerating || filteredBills.length === 0}
                  className="flex-1 md:flex-none"
                >
                  <Download className="mr-2" size={18} />
                  {isGenerating ? "Generating..." : "Download Excel"}
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
