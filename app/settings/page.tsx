"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { profileStorage, dataStorage, type RestaurantProfile } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Download, Upload, Trash2 } from "lucide-react"

export default function SettingsPage() {
  const [profile, setProfile] = useState<RestaurantProfile>(profileStorage.get())
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      if (!profile.name.trim()) {
        alert("Please enter a restaurant name")
        setIsSaving(false)
        return
      }
      profileStorage.set(profile)
      alert("Restaurant profile saved successfully!")
    } catch (error) {
      alert("Error saving profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownloadBackup = () => {
    dataStorage.downloadBackup()
  }

  const handleImportData = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e: any) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event: any) => {
          try {
            const data = JSON.parse(event.target.result)
            dataStorage.importData(data)
            alert("Data imported successfully!")
            window.location.reload()
          } catch (error) {
            alert("Error importing data. Please ensure the file is valid JSON.")
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleResetData = () => {
    const restaurantName = prompt(`To confirm data reset, please type the restaurant name:\n\n"${profile.name}"`, "")

    if (restaurantName === profile.name) {
      dataStorage.resetData()
      alert("All data has been reset. Please refresh the page.")
      window.location.reload()
    } else if (restaurantName !== null) {
      alert("Restaurant name does not match. Data reset cancelled.")
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-card/50 backdrop-blur-md">
          <div className="flex items-center justify-between p-4 lg:pl-6 lg:pr-8">
            <h2 className="text-2xl font-bold">Settings</h2>
            <ThemeToggle />
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-8 space-y-6 max-w-2xl">
          {/* Restaurant Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="restaurant-name">Restaurant Name</Label>
                <Input
                  id="restaurant-name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profile.phone || ""}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile.email || ""}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="gstin">GSTIN</Label>
                <Input
                  id="gstin"
                  value={profile.gstin || ""}
                  onChange={(e) => setProfile({ ...profile, gstin: e.target.value })}
                  placeholder="e.g., 18AABCT1234H1Z5"
                />
              </div>

              <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full">
                {isSaving ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold mb-2">Backup & Restore</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Download your complete data as a JSON file for backup and restore.
                  </p>
                  <Button onClick={handleDownloadBackup} variant="outline" className="w-full bg-transparent">
                    <Download className="mr-2" size={18} />
                    Download Backup
                  </Button>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2">Import Data</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Restore your data from a previously backed up JSON file.
                  </p>
                  <Button onClick={handleImportData} variant="outline" className="w-full bg-transparent">
                    <Upload className="mr-2" size={18} />
                    Import Data
                  </Button>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-sm font-semibold mb-2">Reset Data</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Delete all data permanently. This action cannot be undone.
                  </p>
                  <Button onClick={handleResetData} variant="destructive" className="w-full">
                    <Trash2 className="mr-2" size={18} />
                    Reset All Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>RestoBill</strong> - Professional Restaurant Billing System
              </p>
              <p className="text-sm text-muted-foreground">Version: 1.0.0</p>
              <p className="text-sm text-muted-foreground">
                All data is stored locally in your browser. No data is sent to external servers.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
