"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Sidebar } from "@/components/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { billStorage, type Bill } from "@/lib/storage"
import { calculations } from "@/lib/calculations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, Trash2, Search } from "lucide-react"

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [filteredBills, setFilteredBills] = useState<Bill[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    loadBills()
  }, [])

  useEffect(() => {
    filterBills()
  }, [bills, searchTerm, startDate, endDate])

  const loadBills = () => {
    const allBills = billStorage.getAll()
    setBills(allBills.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
  }

  const filterBills = () => {
    let filtered = bills

    if (searchTerm) {
      filtered = filtered.filter(
        (bill) =>
          bill.invoiceNo.includes(searchTerm) || bill.customer.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (startDate) {
      filtered = filtered.filter((bill) => bill.date >= startDate)
    }

    if (endDate) {
      filtered = filtered.filter((bill) => bill.date <= endDate)
    }

    setFilteredBills(filtered)
  }

  const handleDeleteBill = (invoiceNo: string) => {
    if (confirm("Are you sure you want to delete this bill?")) {
      billStorage.delete(invoiceNo)
      loadBills()
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-card/50 backdrop-blur-md">
          <div className="flex items-center justify-between p-4 lg:pl-6 lg:pr-8">
            <h2 className="text-2xl font-bold">Bills</h2>
            <ThemeToggle />
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-8 space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
                <Input
                  placeholder="Search by invoice or customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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

          {/* Bills List */}
          {filteredBills.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No bills found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredBills.map((bill) => (
                <Card key={bill.invoiceNo} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Invoice</p>
                        <p className="font-semibold">{bill.invoiceNo}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Customer</p>
                        <p className="font-semibold">{bill.customer.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-semibold">{calculations.formatDate(bill.date)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Items</p>
                        <p className="font-semibold">{bill.items.length}</p>
                      </div>
                      <div className="flex items-end justify-between md:flex-col md:items-start">
                        <div>
                          <p className="text-sm text-muted-foreground">Amount</p>
                          <p className="font-semibold text-lg text-primary">
                            {calculations.formatCurrency(bill.finalTotal)}
                          </p>
                        </div>
                        <div className="flex gap-2 md:mt-3">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/bills/${bill.invoiceNo}`}>
                              <Eye size={16} className="mr-1" />
                              View
                            </Link>
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteBill(bill.invoiceNo)}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
