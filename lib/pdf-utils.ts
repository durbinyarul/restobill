// PDF Generation utilities using html2canvas and jsPDF

export const generatePDF = async (element: HTMLElement, filename: string): Promise<void> => {
  try {
    // Dynamically import html2canvas and jsPDF
    const html2canvas = (await import("html2canvas")).default
    const jsPDF = (await import("jspdf")).jsPDF

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    })

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const imgWidth = 210
    const pageHeight = 295
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    let position = 0
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(filename)
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw error
  }
}

export const generateInvoicePDF = async (invoiceHTML: string, invoiceNo: string): Promise<void> => {
  try {
    const jsPDF = (await import("jspdf")).jsPDF
    const html2canvas = (await import("html2canvas")).default

    const element = document.createElement("div")
    element.innerHTML = invoiceHTML
    document.body.appendChild(element)

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
    })

    document.body.removeChild(element)

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const imgData = canvas.toDataURL("image/png")
    pdf.addImage(imgData, "PNG", 0, 0, 210, 297)
    pdf.save(`${invoiceNo}.pdf`)
  } catch (error) {
    console.error("Error generating invoice PDF:", error)
    throw error
  }
}
