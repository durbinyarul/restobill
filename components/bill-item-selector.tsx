"use client"

import { useState, useMemo } from "react"
import type { MenuItem } from "@/lib/storage"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Plus } from "lucide-react"
import { calculations } from "@/lib/calculations"

interface BillItemSelectorProps {
  items: MenuItem[]
  categories: string[]
  onSelectItem: (item: MenuItem) => void
}

export function BillItemSelector({ items, categories, onSelectItem }: BillItemSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedVegType, setSelectedVegType] = useState<"all" | "veg" | "non-veg">("all")
  const [selectedProteins, setSelectedProteins] = useState<string[]>([])

  const availableProteins = useMemo(() => {
    const proteins = new Set<string>()
    items.forEach((item) => {
      if (item.protein) proteins.add(item.protein)
    })
    return Array.from(proteins).sort()
  }, [items])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !selectedCategory || item.category === selectedCategory
      const matchesVegType = selectedVegType === "all" || item.vegNonVeg === selectedVegType
      const matchesProtein = selectedProteins.length === 0 || (item.protein && selectedProteins.includes(item.protein))
      return matchesSearch && matchesCategory && matchesVegType && matchesProtein
    })
  }, [items, searchTerm, selectedCategory, selectedVegType, selectedProteins])

  console.log("[v0] BillItemSelector items:", items.length, "filtered:", filteredItems.length)

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
        <Input
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-11 text-base"
        />
      </div>

      {/* Category Filter - Horizontal scrollable pills */}
      <div>
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-3">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className={selectedCategory === null ? "rounded-full px-4" : "rounded-full px-4"}
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="rounded-full px-4 whitespace-nowrap"
              >
                {cat}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Additional Filters - Veg/Non-Veg and Protein */}
      {(selectedVegType !== "all" || selectedProteins.length > 0) && (
        <div className="space-y-2">
          {/* Veg/Non-Veg Quick Toggle */}
          <div className="flex gap-2">
            <Button
              variant={selectedVegType === "all" ? "outline" : "default"}
              size="sm"
              onClick={() => setSelectedVegType("all")}
              className="text-xs"
            >
              All Types
            </Button>
            <Button
              variant={selectedVegType === "veg" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedVegType("veg")}
              className={`text-xs ${selectedVegType === "veg" ? "bg-green-600 hover:bg-green-700 border-green-600" : ""}`}
            >
              Veg
            </Button>
            <Button
              variant={selectedVegType === "non-veg" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedVegType("non-veg")}
              className={`text-xs ${selectedVegType === "non-veg" ? "bg-orange-600 hover:bg-orange-700 border-orange-600" : ""}`}
            >
              Non-Veg
            </Button>
          </div>

          {/* Protein Filter */}
          {availableProteins.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {availableProteins.map((protein) => (
                <Badge
                  key={protein}
                  variant={selectedProteins.includes(protein) ? "default" : "outline"}
                  className="cursor-pointer capitalize px-3 py-1"
                  onClick={() => {
                    setSelectedProteins((prev) =>
                      prev.includes(protein) ? prev.filter((p) => p !== protein) : [...prev, protein],
                    )
                  }}
                >
                  {protein}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
        {filteredItems.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            {items.length === 0 ? "Loading items..." : "No items found"}
          </div>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-semibold text-foreground">{item.name}</h4>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          item.vegNonVeg === "veg" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {item.vegNonVeg === "veg" ? "Veg" : "Non-Veg"}
                      </Badge>
                      {item.protein && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {item.protein}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => onSelectItem(item)} className="h-8 w-8">
                    <Plus size={16} />
                  </Button>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Price: {calculations.formatCurrency(item.price)}</span>
                  <span className="text-muted-foreground">Tax: {item.tax}%</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
