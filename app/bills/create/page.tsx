"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { BillItemSelector } from "@/components/bill-item-selector"
import {
  menuStorage,
  billStorage,
  invoiceStorage,
  profileStorage,
  dataStorage,
  type MenuItem,
  type BillItem,
  type Bill,
} from "@/lib/storage"
import { calculations } from "@/lib/calculations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Save, Eye } from "lucide-react"
import Link from "next/link"

export default function CreateBillPage() {
  const router = useRouter()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [billItems, setBillItems] = useState<BillItem[]>([])
  const [profile, setProfile] = useState(profileStorage.get())
  const [isLoading, setIsLoading] = useState(true)

  // Customer info
  const [customerName, setCustomerName] = useState("")
  const [customerMobile, setCustomerMobile] = useState("")
  const [tableNo, setTableNo] = useState("")
  const [discount, setDiscount] = useState(0)
  const [customerId, setCustomerId] = useState("")

  // Totals
  const [totals, setTotals] = useState({
    subtotal: 0,
    totalTax: 0,
    finalTotal: 0,
  })

  const [isPreview, setIsPreview] = useState(false)

  useEffect(() => {
    try {
      const items = menuStorage.getAll()
      console.log("[v0] Menu items loaded:", items.length)

      // If no items exist, initialize from storage
      if (items.length === 0) {
        dataStorage.initializeData()
        const reinitializedItems = menuStorage.getAll()
        console.log("[v0] Menu items after reinitialization:", reinitializedItems.length)
        setMenuItems(reinitializedItems)
        setCategories(menuStorage.getCategories())
      } else {
        setMenuItems(items)
        setCategories(menuStorage.getCategories())
      }

      const bills = billStorage.getAll()
      const totalBills = bills.length
      const customerId = `CUS${(totalBills + 1).toString().padStart(6, "0")}`
      setCustomerId(customerId)
      setCustomerName(customerId)

      setIsLoading(false)
    } catch (error) {
      console.error("[v0] Error loading menu items:", error)
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const newTotals = calculations.calculateBillTotals(billItems, discount)
    setTotals(newTotals)
  }, [billItems, discount])

  const handleAddItem = (item: MenuItem) => {
    const existingItem = billItems.find((bi) => bi.menuItemId === item.id)
    if (existingItem) {
      updateItemQuantity(item.id, existingItem.quantity + 1)
    } else {
      const calc = calculations.calculateItemTotal(item.price, 1, item.tax)
      const newBillItem: BillItem = {
        id: Date.now().toString(),
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        tax: item.tax, // Store the tax percentage for reference
        quantity: 1,
        amount: calc.amount,
        taxAmount: calc.taxAmount,
      }
      setBillItems([...billItems, newBillItem])
    }
  }

  const updateItemQuantity = (menuItemId: string, quantity: number) => {
    const item = billItems.find((bi) => bi.menuItemId === menuItemId)
    if (item && quantity > 0) {
      const calc = calculations.calculateItemTotal(item.price, quantity, item.tax)
      const updated = billItems.map((bi) =>
        bi.menuItemId === menuItemId ? { ...bi, quantity, amount: calc.amount, taxAmount: calc.taxAmount } : bi,
      )
      setBillItems(updated)
    }
  }

  const removeItem = (menuItemId: string) => {
    setBillItems(billItems.filter((bi) => bi.menuItemId !== menuItemId))
  }

  const saveBill = async () => {
    if (!customerName.trim()) {
      alert("Please enter customer name")
      return
    }
    if (billItems.length === 0) {
      alert("Please add at least one item")
      return
    }

    try {
      const invoiceNo = invoiceStorage.generateInvoiceNo()
      const bill: Bill = {
        invoiceNo,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        customer: {
          name: customerName,
          mobile: customerMobile || undefined,
          tableNo: tableNo || undefined,
        },
        items: billItems,
        subtotal: totals.subtotal,
        totalTax: totals.totalTax,
        discount,
        finalTotal: totals.finalTotal,
      }

      billStorage.add(bill)
      alert(`Bill saved successfully! Invoice: ${invoiceNo}`)
      router.push(`/bills/${invoiceNo}`)
    } catch (error) {
      console.error("[v0] Error saving bill:", error)
      alert("Error saving bill. Please try again.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Loading menu...</p>
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
        <header className="sticky top-0 z-30 border-b border-border bg-card/50 backdrop-blur-md">
          <div className="flex items-center justify-between p-4 lg:pl-6 lg:pr-8">
            <h2 className="text-2xl font-bold">Create New Bill</h2>
            <ThemeToggle />
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Item Selector */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="customer-name">Customer Name / ID *</Label>
                    <Input
                      id="customer-name"
                      placeholder={customerId || "Enter customer name"}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Default: {customerId}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customer-mobile">Mobile (Optional)</Label>
                      <Input
                        id="customer-mobile"
                        placeholder="Enter mobile number"
                        value={customerMobile}
                        onChange={(e) => setCustomerMobile(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="table-no">Table/Order No (Optional)</Label>
                      <Input
                        id="table-no"
                        placeholder="e.g., T-01 or Order #123"
                        value={tableNo}
                        onChange={(e) => setTableNo(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Select Items</CardTitle>
                </CardHeader>
                <CardContent>
                  {menuItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No menu items available. Add items in Menu Management first.</p>
                      <Button asChild variant="link" className="mt-2">
                        <Link href="/menu">Go to Menu</Link>
                      </Button>
                    </div>
                  ) : (
                    <BillItemSelector items={menuItems} categories={categories} onSelectItem={handleAddItem} />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right: Bill Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 space-y-4">
                <CardHeader>
                  <CardTitle>Bill Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Items List */}
                  <div className="max-h-64 overflow-y-auto space-y-3">
                    {billItems.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No items added yet</p>
                    ) : (
                      billItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start justify-between gap-2 p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-sm font-semibold text-foreground truncate">{item.name}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => updateItemQuantity(item.menuItemId, item.quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center bg-background rounded text-sm font-semibold"
                              >
                                −
                              </button>
                              <span className="w-8 text-center text-sm">{item.quantity}</span>
                              <button
                                onClick={() => updateItemQuantity(item.menuItemId, item.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center bg-background rounded text-sm font-semibold"
                              >
                                +
                              </button>
                              <button
                                onClick={() => removeItem(item.menuItemId)}
                                className="ml-auto p-1 hover:bg-destructive/10 rounded text-destructive"
                              >
                                <X size={16} />
                              </button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {calculations.formatCurrency(item.amount + item.taxAmount)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>{calculations.formatCurrency(totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax:</span>
                      <span>{calculations.formatCurrency(totals.totalTax)}</span>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discount" className="text-sm">
                        Discount:
                      </Label>
                      <Input
                        id="discount"
                        type="number"
                        min="0"
                        value={discount}
                        onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                        placeholder="0"
                      />
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-border pt-3">
                      <span>Total:</span>
                      <span className="text-primary">{calculations.formatCurrency(totals.finalTotal)}</span>
                    </div>
                  </div>

                  <Button onClick={() => setIsPreview(true)} variant="outline" className="w-full">
                    <Eye className="mr-2" size={18} />
                    Preview
                  </Button>

                  <Button
                    onClick={saveBill}
                    className="w-full"
                    disabled={billItems.length === 0 || !customerName.trim()}
                  >
                    <Save className="mr-2" size={18} />
                    Save Bill
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
