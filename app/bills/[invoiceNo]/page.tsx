"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { billStorage, type Bill, profileStorage } from "@/lib/storage"
import { calculations } from "@/lib/calculations"
import { Button } from "@/components/ui/button"
import { Download, Printer as Print } from "lucide-react"
import Link from "next/link"
import { generateInvoicePDF } from "@/lib/pdf-utils"

export default function BillViewPage() {
  const params = useParams()
  const invoiceNo = params.invoiceNo as string
  const [bill, setBill] = useState<Bill | null>(null)
  const [profile, setProfile] = useState(profileStorage.get())
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  useEffect(() => {
    const foundBill = billStorage.getByInvoiceNo(invoiceNo)
    setBill(foundBill || null)
    setProfile(profileStorage.get())
  }, [invoiceNo])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    if (!bill) return

    setIsGeneratingPDF(true)
    try {
      const invoiceElement = document.getElementById("invoice-content")
      if (invoiceElement) {
        const invoiceHTML = invoiceElement.innerHTML
        await generateInvoicePDF(invoiceHTML, bill.invoiceNo)
      }
    } catch (error) {
      alert("Error generating PDF")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  if (!bill) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1">
          <header className="sticky top-0 z-30 border-b border-border bg-card/50 backdrop-blur-md">
            <div className="flex items-center justify-between p-4 lg:pl-6 lg:pr-8">
              <h2 className="text-2xl font-bold">Bill Not Found</h2>
              <ThemeToggle />
            </div>
          </header>
          <div className="p-8">
            <Button asChild>
              <Link href="/bills">Go Back to Bills</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-card/50 backdrop-blur-md print-hidden">
          <div className="flex items-center justify-between p-4 lg:pl-6 lg:pr-8">
            <div>
              <h2 className="text-2xl font-bold">Invoice {bill.invoiceNo}</h2>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button variant="outline" onClick={handlePrint}>
                <Print className="mr-2" size={18} />
                Print
              </Button>
              <Button onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
                <Download className="mr-2" size={18} />
                {isGeneratingPDF ? "Generating..." : "PDF"}
              </Button>
            </div>
          </div>
        </header>

        {/* Invoice Content */}
        <div className="p-4 lg:p-8">
          <div id="invoice-content" className="bg-card border border-border rounded-lg p-8 max-w-4xl mx-auto">
            {/* Restaurant Header */}
            <div className="text-center border-b border-border pb-6 mb-6">
              <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
              <p className="text-sm text-muted-foreground">{profile.address}</p>
              {profile.phone && <p className="text-sm text-muted-foreground">{profile.phone}</p>}
              {profile.gstin && <p className="text-sm text-muted-foreground">GSTIN: {profile.gstin}</p>}
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Invoice Number</p>
                <p className="font-semibold">{bill.invoiceNo}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Date</p>
                <p className="font-semibold">{calculations.formatDate(bill.date)}</p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold mb-2">Bill To</h3>
                <p className="text-sm">{bill.customer.name}</p>
                {bill.customer.mobile && <p className="text-sm text-muted-foreground">{bill.customer.mobile}</p>}
                {bill.customer.tableNo && (
                  <p className="text-sm text-muted-foreground">Table/Order: {bill.customer.tableNo}</p>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left py-3 px-2">Item</th>
                    <th className="text-right py-3 px-2">Qty</th>
                    <th className="text-right py-3 px-2">Rate</th>
                    <th className="text-right py-3 px-2">Amount</th>
                    <th className="text-right py-3 px-2">Tax</th>
                    <th className="text-right py-3 px-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.items.map((item) => (
                    <tr key={item.id} className="border-b border-border">
                      <td className="py-3 px-2">{item.name}</td>
                      <td className="text-right py-3 px-2">{item.quantity}</td>
                      <td className="text-right py-3 px-2">{calculations.formatCurrency(item.price)}</td>
                      <td className="text-right py-3 px-2">{calculations.formatCurrency(item.amount)}</td>
                      <td className="text-right py-3 px-2">{calculations.formatCurrency(item.taxAmount)}</td>
                      <td className="text-right py-3 px-2">
                        {calculations.formatCurrency(item.amount + item.taxAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-full md:w-1/3">
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{calculations.formatCurrency(bill.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{calculations.formatCurrency(bill.totalTax)}</span>
                  </div>
                  {bill.discount > 0 && (
                    <div className="flex justify-between text-destructive">
                      <span>Discount:</span>
                      <span>-{calculations.formatCurrency(bill.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                    <span>Total:</span>
                    <span>{calculations.formatCurrency(bill.finalTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center border-t border-border pt-6">
              <p className="text-sm font-semibold mb-4">Thank You for your business!</p>
              <p className="text-xs text-muted-foreground">
                This is a computer-generated invoice. No signature required.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
