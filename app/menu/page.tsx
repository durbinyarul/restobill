"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { menuStorage, type MenuItem } from "@/lib/storage"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit2, Trash2, Search } from "lucide-react"
import { calculations } from "@/lib/calculations"

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedVegType, setSelectedVegType] = useState<string | null>(null)
  const [selectedProteins, setSelectedProteins] = useState<Set<string>>(new Set())
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [form, setForm] = useState({
    name: "",
    category: "",
    vegNonVeg: "veg" as "veg" | "non-veg",
    protein: null as string | null,
    price: "",
    tax: "",
    description: "",
    quantity: "",
  })

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = () => {
    const allItems = menuStorage.getAll()
    setItems(allItems)
    setCategories(menuStorage.getCategories())
  }

  const handleAddItem = (item: MenuItem) => {
    setEditingId(item.id)
    setForm({
      name: item.name,
      category: item.category,
      vegNonVeg: item.vegNonVeg,
      protein: item.vegNonVeg === "non-veg" ? item.protein : null,
      price: item.price.toString(),
      tax: item.tax.toString(),
      description: item.description || "",
      quantity: item.quantity.toString(),
    })
    setIsOpen(true)
  }

  const handleSaveItem = () => {
    if (!form.name || !form.category || !form.price) {
      alert("Please fill in all required fields")
      return
    }

    if (editingId) {
      menuStorage.update(editingId, {
        name: form.name,
        category: form.category,
        vegNonVeg: form.vegNonVeg,
        protein: form.vegNonVeg === "non-veg" ? (form.protein as any) : null,
        price: Number(form.price),
        tax: Number(form.tax),
        description: form.description,
        quantity: Number(form.quantity) || 0,
      })
    } else {
      menuStorage.add({
        id: "",
        name: form.name,
        category: form.category,
        vegNonVeg: form.vegNonVeg,
        protein: form.vegNonVeg === "non-veg" ? (form.protein as any) : null,
        price: Number(form.price),
        tax: Number(form.tax),
        description: form.description,
        quantity: Number(form.quantity) || 0,
      })
    }

    resetForm()
    loadItems()
    setIsOpen(false)
  }

  const handleDeleteItem = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      menuStorage.delete(id)
      loadItems()
    }
  }

  const resetForm = () => {
    setForm({
      name: "",
      category: "",
      vegNonVeg: "veg",
      protein: null,
      price: "",
      tax: "",
      description: "",
      quantity: "",
    })
    setEditingId(null)
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || item.category === selectedCategory
    const matchesVegType = !selectedVegType || item.vegNonVeg === selectedVegType
    const matchesProtein = selectedProteins.size === 0 || (item.protein && selectedProteins.has(item.protein))

    return matchesSearch && matchesCategory && matchesVegType && matchesProtein
  })

  const proteinOptions = ["chicken", "mutton", "fish", "prawns", "egg", "prawn"]

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-card/50 backdrop-blur-md">
          <div className="flex items-center justify-between p-4 lg:pl-6 lg:pr-8">
            <h2 className="text-2xl font-bold">Menu Management</h2>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => resetForm()}>
                    <Plus className="mr-2" size={18} />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingId ? "Edit Item" : "Add New Item"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Item Name *</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g., Butter Chicken"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <select
                        id="category"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      >
                        <option value="">Select Category</option>
                        <option value="Starters">Starters</option>
                        <option value="Main Curries">Main Curries</option>
                        <option value="Rice Dishes">Rice Dishes</option>
                        <option value="Biryani">Biryani</option>
                        <option value="Desserts">Desserts</option>
                        <option value="Drinks">Drinks</option>
                        <option value="Side Dish">Side Dish</option>
                        <option value="Soups">Soups</option>
                        <option value="Snacks">Snacks</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                    <div>
                      <Label>Veg / Non-Veg *</Label>
                      <div className="flex gap-4 mt-2">
                        <button
                          onClick={() => setForm({ ...form, vegNonVeg: "veg", protein: null })}
                          className={`flex-1 py-2 px-4 rounded-md border-2 transition-colors ${
                            form.vegNonVeg === "veg"
                              ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-950"
                              : "border-gray-300 text-gray-700"
                          }`}
                        >
                          Veg
                        </button>
                        <button
                          onClick={() => setForm({ ...form, vegNonVeg: "non-veg" })}
                          className={`flex-1 py-2 px-4 rounded-md border-2 transition-colors ${
                            form.vegNonVeg === "non-veg"
                              ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950"
                              : "border-gray-300 text-gray-700"
                          }`}
                        >
                          Non-Veg
                        </button>
                      </div>
                    </div>
                    {form.vegNonVeg === "non-veg" && (
                      <div>
                        <Label>Protein Type</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {proteinOptions.map((protein) => (
                            <label key={protein} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={form.protein === protein}
                                onChange={(e) => setForm({ ...form, protein: e.target.checked ? protein : null })}
                                className="w-4 h-4"
                              />
                              <span className="capitalize">{protein}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price (₹) *</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={form.price}
                          onChange={(e) => setForm({ ...form, price: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tax">Tax (%) *</Label>
                        <Input
                          id="tax"
                          type="number"
                          step="0.01"
                          value={form.tax}
                          onChange={(e) => setForm({ ...form, tax: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Optional description"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quantity">Quantity in Stock</Label>
                      <Input
                        id="quantity"
                        type="number"
                        step="1"
                        value={form.quantity}
                        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <Button onClick={handleSaveItem} className="w-full">
                      {editingId ? "Update Item" : "Add Item"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-8 space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Category</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                  >
                    All
                  </Button>
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Veg/Non-Veg Filter */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Type</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedVegType === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedVegType(null)}
                  >
                    All
                  </Button>
                  <Button
                    variant={selectedVegType === "veg" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedVegType("veg")}
                  >
                    Veg
                  </Button>
                  <Button
                    variant={selectedVegType === "non-veg" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedVegType("non-veg")}
                  >
                    Non-Veg
                  </Button>
                </div>
              </div>

              {/* Protein Filter */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Protein Type</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                  {proteinOptions.map((protein) => (
                    <label key={protein} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedProteins.has(protein)}
                        onChange={(e) => {
                          const newProteins = new Set(selectedProteins)
                          if (e.target.checked) {
                            newProteins.add(protein)
                          } else {
                            newProteins.delete(protein)
                          }
                          setSelectedProteins(newProteins)
                        }}
                        className="w-4 h-4 rounded"
                      />
                      <span className="capitalize text-sm">{protein}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items Grid */}
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No items found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">{item.category}</p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              item.vegNonVeg === "veg"
                                ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200"
                                : "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200"
                            }`}
                          >
                            {item.vegNonVeg === "veg" ? "Veg" : "Non-Veg"}
                          </span>
                        </div>
                        {item.protein && (
                          <p className="text-xs text-muted-foreground capitalize">Protein: {item.protein}</p>
                        )}
                        {item.description && <p className="text-sm text-foreground/70 mt-2">{item.description}</p>}
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-border">
                        <div>
                          <p className="text-sm text-muted-foreground">Price</p>
                          <p className="font-semibold">{calculations.formatCurrency(item.price)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Tax</p>
                          <p className="font-semibold">{item.tax}%</p>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() => handleAddItem(item)}
                        >
                          <Edit2 size={16} className="mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 size={16} className="mr-2" />
                          Delete
                        </Button>
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
