// Calculation utilities for bills and reports

import type { BillItem, Bill } from "./storage"

export const calculations = {
  // Calculate item total
  calculateItemTotal: (price: number, quantity: number, taxPercent: number) => {
    const amount = price * quantity
    const taxAmount = amount * (taxPercent / 100)
    return {
      amount,
      taxAmount,
      total: amount + taxAmount,
    }
  },

  // Calculate bill totals
  calculateBillTotals: (items: BillItem[], discount = 0) => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
    const totalTax = items.reduce((sum, item) => sum + item.taxAmount, 0)
    const finalTotal = subtotal + totalTax - discount

    return {
      subtotal,
      totalTax,
      discount,
      finalTotal,
    }
  },

  // Format currency
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  },

  // Format date
  formatDate: (dateString: string): string => {
    return new Date(dateString + "T00:00:00").toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  },

  // Generate MIS Report
  generateMISReport: (bills: Bill[]) => {
    const totalSales = bills.reduce((sum, b) => sum + b.finalTotal, 0)
    const totalTax = bills.reduce((sum, b) => sum + b.totalTax, 0)
    const invoiceCount = bills.length

    // Item-wise sales
    const itemSales: Record<string, { count: number; total: number }> = {}
    bills.forEach((bill) => {
      bill.items.forEach((item) => {
        if (!itemSales[item.name]) {
          itemSales[item.name] = { count: 0, total: 0 }
        }
        itemSales[item.name].count += item.quantity
        itemSales[item.name].total += item.amount + item.taxAmount
      })
    })

    // Top 5 items
    const top5Items = Object.entries(itemSales)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5)
      .map(([name, data]) => ({ name, ...data }))

    // Daily sales
    const dailySales: Record<string, number> = {}
    bills.forEach((bill) => {
      if (!dailySales[bill.date]) {
        dailySales[bill.date] = 0
      }
      dailySales[bill.date] += bill.finalTotal
    })

    return {
      totalSales,
      totalTax,
      invoiceCount,
      averageOrderValue: invoiceCount > 0 ? totalSales / invoiceCount : 0,
      itemSales,
      top5Items,
      dailySales,
    }
  },
}
