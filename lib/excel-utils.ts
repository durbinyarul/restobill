// Excel export utilities using SheetJS (xlsx)

export const generateExcel = async (data: any[], sheetName: string, filename: string): Promise<void> => {
  try {
    const XLSX = await import("xlsx")
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
    XLSX.writeFile(workbook, filename)
  } catch (error) {
    console.error("Error generating Excel:", error)
    throw error
  }
}

export const generateMISExcel = async (misData: any, filename: string): Promise<void> => {
  try {
    const XLSX = await import("xlsx")
    const workbook = XLSX.utils.book_new()

    // Summary sheet
    const summaryData = [
      { Metric: "Total Sales", Value: misData.totalSales },
      { Metric: "Total Tax", Value: misData.totalTax },
      { Metric: "Number of Invoices", Value: misData.invoiceCount },
      { Metric: "Average Order Value", Value: misData.averageOrderValue },
    ]
    const summarySheet = XLSX.utils.json_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary")

    // Top Items sheet
    const topItemsSheet = XLSX.utils.json_to_sheet(misData.top5Items)
    XLSX.utils.book_append_sheet(workbook, topItemsSheet, "Top 5 Items")

    // Daily Sales sheet
    const dailySalesData = Object.entries(misData.dailySales).map(([date, total]) => ({
      Date: date,
      Total: total,
    }))
    const dailySalesSheet = XLSX.utils.json_to_sheet(dailySalesData)
    XLSX.utils.book_append_sheet(workbook, dailySalesSheet, "Daily Sales")

    XLSX.writeFile(workbook, filename)
  } catch (error) {
    console.error("Error generating MIS Excel:", error)
    throw error
  }
}
