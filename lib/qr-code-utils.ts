// QR Code generation utility

export const generateQRCode = async (text: string): Promise<string> => {
  try {
    const QRCode = await import("qrcode")
    return await QRCode.default.toDataURL(text, {
      errorCorrectionLevel: "H",
      type: "image/png",
      quality: 0.95,
      margin: 1,
      width: 200,
    })
  } catch (error) {
    console.error("Error generating QR code:", error)
    return ""
  }
}
