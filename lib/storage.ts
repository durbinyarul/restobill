// LocalStorage utilities for the Restaurant Billing System
// Handles all data persistence with localStorage

export interface MenuItem {
  id: string
  name: string
  category: string
  vegNonVeg: "veg" | "non-veg"
  protein?: "chicken" | "mutton" | "fish" | "prawns" | "egg" | "prawn" | null
  price: number
  tax: number
  description?: string
  quantity: number
}

export interface BillItem {
  id: string
  menuItemId: string
  name: string
  price: number
  tax: number
  quantity: number
  amount: number
  taxAmount: number
}

export interface Bill {
  invoiceNo: string
  date: string
  time: string
  customer: {
    name: string
    mobile?: string
    tableNo?: string
  }
  items: BillItem[]
  subtotal: number
  totalTax: number
  discount: number
  finalTotal: number
  paymentMethod?: string
  notes?: string
}

export interface RestaurantProfile {
  name: string
  address: string
  phone?: string
  email?: string
  gstin?: string
  logo?: string
}

// Storage Keys
const STORAGE_KEYS = {
  MENU_ITEMS: "menuItems",
  BILLS: "bills",
  RESTAURANT_PROFILE: "restaurantProfile",
  BILL_COUNTER: "billCounter",
}

const isLocalStorageAvailable = (): boolean => {
  try {
    if (typeof window === "undefined") return false
    const test = "__localStorage_test__"
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

// Menu Items Storage
export const menuStorage = {
  getAll: (): MenuItem[] => {
    if (!isLocalStorageAvailable()) return []
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MENU_ITEMS)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error("[v0] Error reading menu items:", error)
      return []
    }
  },

  add: (item: MenuItem): MenuItem => {
    if (!isLocalStorageAvailable()) return item
    try {
      const items = menuStorage.getAll()
      const newItem = { ...item, id: item.id || generateMenuItemId() }
      items.push(newItem)
      localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(items))
      return newItem
    } catch (error) {
      console.error("[v0] Error adding menu item:", error)
      return item
    }
  },

  update: (id: string, item: Partial<MenuItem>): void => {
    if (!isLocalStorageAvailable()) return
    try {
      const items = menuStorage.getAll()
      const index = items.findIndex((i) => i.id === id)
      if (index !== -1) {
        items[index] = { ...items[index], ...item }
        localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(items))
      }
    } catch (error) {
      console.error("[v0] Error updating menu item:", error)
    }
  },

  delete: (id: string): void => {
    if (!isLocalStorageAvailable()) return
    try {
      const items = menuStorage.getAll()
      const filtered = items.filter((i) => i.id !== id)
      localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(filtered))
    } catch (error) {
      console.error("[v0] Error deleting menu item:", error)
    }
  },

  getByCategory: (category: string): MenuItem[] => {
    return menuStorage.getAll().filter((i) => i.category === category)
  },

  getCategories: (): string[] => {
    const items = menuStorage.getAll()
    return [...new Set(items.map((i) => i.category))]
  },

  getByVegType: (vegNonVeg: "veg" | "non-veg"): MenuItem[] => {
    return menuStorage.getAll().filter((i) => i.vegNonVeg === vegNonVeg)
  },

  getByProtein: (protein: string): MenuItem[] => {
    return menuStorage.getAll().filter((i) => i.protein === protein)
  },
}

// Bills Storage
export const billStorage = {
  getAll: (): Bill[] => {
    if (!isLocalStorageAvailable()) return []
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BILLS)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error("[v0] Error reading bills:", error)
      return []
    }
  },

  add: (bill: Bill): Bill => {
    if (!isLocalStorageAvailable()) return bill
    try {
      const bills = billStorage.getAll()
      bills.push(bill)
      localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills))
      return bill
    } catch (error) {
      console.error("[v0] Error adding bill:", error)
      throw new Error("Failed to save bill")
    }
  },

  update: (invoiceNo: string, bill: Partial<Bill>): void => {
    if (!isLocalStorageAvailable()) return
    try {
      const bills = billStorage.getAll()
      const index = bills.findIndex((b) => b.invoiceNo === invoiceNo)
      if (index !== -1) {
        bills[index] = { ...bills[index], ...bill }
        localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills))
      }
    } catch (error) {
      console.error("[v0] Error updating bill:", error)
    }
  },

  delete: (invoiceNo: string): void => {
    if (!isLocalStorageAvailable()) return
    try {
      const bills = billStorage.getAll()
      const filtered = bills.filter((b) => b.invoiceNo !== invoiceNo)
      localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(filtered))
    } catch (error) {
      console.error("[v0] Error deleting bill:", error)
    }
  },

  getByDate: (date: string): Bill[] => {
    return billStorage.getAll().filter((b) => b.date === date)
  },

  getByDateRange: (startDate: string, endDate: string): Bill[] => {
    return billStorage.getAll().filter((b) => {
      return b.date >= startDate && b.date <= endDate
    })
  },

  getByInvoiceNo: (invoiceNo: string): Bill | undefined => {
    return billStorage.getAll().find((b) => b.invoiceNo === invoiceNo)
  },

  getByCustomerName: (name: string): Bill[] => {
    return billStorage.getAll().filter((b) => b.customer.name.toLowerCase().includes(name.toLowerCase()))
  },
}

// Invoice Number Generation
export const invoiceStorage = {
  generateInvoiceNo: (): string => {
    const profile = profileStorage.get()
    const restaurantPrefix = profile.name.charAt(0).toUpperCase()

    const bills = billStorage.getAll()
    const totalBills = bills.length
    const counter = totalBills + 1

    return `${restaurantPrefix}${counter.toString().padStart(5, "0")}`
  },
}

// Restaurant Profile Storage
export const profileStorage = {
  get: (): RestaurantProfile => {
    if (!isLocalStorageAvailable()) return getDefaultProfile()
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RESTAURANT_PROFILE)
      return data ? JSON.parse(data) : getDefaultProfile()
    } catch (error) {
      console.error("[v0] Error reading profile:", error)
      return getDefaultProfile()
    }
  },

  set: (profile: RestaurantProfile): void => {
    if (!isLocalStorageAvailable()) return
    try {
      localStorage.setItem(STORAGE_KEYS.RESTAURANT_PROFILE, JSON.stringify(profile))
    } catch (error) {
      console.error("[v0] Error saving profile:", error)
    }
  },
}

function getDefaultProfile(): RestaurantProfile {
  return {
    name: "My Restaurant",
    address: "123 Main Street, City, State 12345",
    phone: "+1 (555) 000-0000",
    email: "info@restaurant.com",
    gstin: "18AABCT1234H1Z5",
    logo: "",
  }
}

function generateMenuItemId(): string {
  const items = menuStorage.getAll()
  const maxId = items.reduce((max, item) => {
    const num = Number.parseInt(item.id.replace("M", "") || "0")
    return Math.max(max, num)
  }, 0)
  return `M${(maxId + 1).toString().padStart(5, "0")}`
}

// Initialization function for sample menu items on first load
function initializeSampleMenuItems(): void {
  if (!isLocalStorageAvailable()) return

  const existingItems = menuStorage.getAll()
  if (existingItems.length > 0) return // Skip if items already exist

  const sampleItems: MenuItem[] = [
    // Starters
    {
      id: "M00001",
      name: "Chicken 65",
      category: "Starters",
      vegNonVeg: "non-veg",
      protein: "chicken",
      price: 220,
      tax: 5,
      description: "Spicy fried chicken",
      quantity: 10,
    },
    {
      id: "M00002",
      name: "Tandoori Chicken",
      category: "Starters",
      vegNonVeg: "non-veg",
      protein: "chicken",
      price: 280,
      tax: 5,
      description: "Grilled chicken with spices",
      quantity: 10,
    },
    {
      id: "M00003",
      name: "Fish Pakora",
      category: "Starters",
      vegNonVeg: "non-veg",
      protein: "fish",
      price: 240,
      tax: 5,
      description: "Crispy fried fish pieces",
      quantity: 10,
    },
    {
      id: "M00004",
      name: "Seekh Kebabs",
      category: "Starters",
      vegNonVeg: "non-veg",
      protein: "mutton",
      price: 250,
      tax: 5,
      description: "Minced meat skewers",
      quantity: 10,
    },
    {
      id: "M00005",
      name: "Fried Chicken Chilly",
      category: "Starters",
      vegNonVeg: "non-veg",
      protein: "chicken",
      price: 260,
      tax: 5,
      description: "Crispy fried chicken with chilly coriander",
      quantity: 10,
    },
    {
      id: "M00006",
      name: "Paneer Tikka",
      category: "Starters",
      vegNonVeg: "veg",
      protein: null,
      price: 200,
      tax: 5,
      description: "Grilled cottage cheese",
      quantity: 10,
    },

    // Soups
    {
      id: "M00007",
      name: "Mulligatawny",
      category: "Soups",
      vegNonVeg: "veg",
      protein: null,
      price: 120,
      tax: 5,
      description: "Traditional lentil soup",
      quantity: 10,
    },
    {
      id: "M00008",
      name: "Sweet Corn Chicken",
      category: "Soups",
      vegNonVeg: "non-veg",
      protein: "chicken",
      price: 140,
      tax: 5,
      description: "Creamy sweet corn with chicken",
      quantity: 10,
    },
    {
      id: "M00009",
      name: "Mutton Soup (Marag)",
      category: "Soups",
      vegNonVeg: "non-veg",
      protein: "mutton",
      price: 160,
      tax: 5,
      description: "Hyderabadi style mutton soup",
      quantity: 10,
    },
    {
      id: "M00010",
      name: "Dal Pudina",
      category: "Soups",
      vegNonVeg: "veg",
      protein: null,
      price: 100,
      tax: 5,
      description: "Lentil soup with mint",
      quantity: 10,
    },

    // Main Curries
    {
      id: "M00011",
      name: "Butter Chicken",
      category: "Main Curries",
      vegNonVeg: "non-veg",
      protein: "chicken",
      price: 320,
      tax: 5,
      description: "Creamy tomato-based curry",
      quantity: 10,
    },
    {
      id: "M00012",
      name: "Chicken Chettinad",
      category: "Main Curries",
      vegNonVeg: "non-veg",
      protein: "chicken",
      price: 300,
      tax: 5,
      description: "Spicy with coconut and pepper",
      quantity: 10,
    },
    {
      id: "M00013",
      name: "Mutton Rogan Josh",
      category: "Main Curries",
      vegNonVeg: "non-veg",
      protein: "mutton",
      price: 340,
      tax: 5,
      description: "Aromatic mutton curry",
      quantity: 10,
    },
    {
      id: "M00014",
      name: "Goan Fish Curry",
      category: "Main Curries",
      vegNonVeg: "non-veg",
      protein: "fish",
      price: 360,
      tax: 5,
      description: "Tangy coconut fish curry",
      quantity: 10,
    },
    {
      id: "M00015",
      name: "Kerala Mutton Curry",
      category: "Main Curries",
      vegNonVeg: "non-veg",
      protein: "mutton",
      price: 350,
      tax: 5,
      description: "Spicy black pepper mutton",
      quantity: 10,
    },
    {
      id: "M00016",
      name: "Kosha Mangsho",
      category: "Main Curries",
      vegNonVeg: "non-veg",
      protein: "mutton",
      price: 330,
      tax: 5,
      description: "Bengali spiced mutton",
      quantity: 10,
    },
    {
      id: "M00017",
      name: "Palak Paneer",
      category: "Main Curries",
      vegNonVeg: "veg",
      protein: null,
      price: 260,
      tax: 5,
      description: "Cottage cheese in spinach gravy",
      quantity: 10,
    },
    {
      id: "M00018",
      name: "Paneer Tikka Masala",
      category: "Main Curries",
      vegNonVeg: "veg",
      protein: null,
      price: 280,
      tax: 5,
      description: "Cottage cheese in creamy sauce",
      quantity: 10,
    },
    {
      id: "M00019",
      name: "Dal Makhani",
      category: "Main Curries",
      vegNonVeg: "veg",
      protein: null,
      price: 200,
      tax: 5,
      description: "Creamy lentil preparation",
      quantity: 10,
    },
    {
      id: "M00020",
      name: "Chana Masala",
      category: "Main Curries",
      vegNonVeg: "veg",
      protein: null,
      price: 180,
      tax: 5,
      description: "Spiced chickpea curry",
      quantity: 10,
    },

    // Rice & Breads
    {
      id: "M00021",
      name: "Hyderabadi Biryani",
      category: "Rice Dishes",
      vegNonVeg: "non-veg",
      protein: "chicken",
      price: 280,
      tax: 5,
      description: "Layered rice with meat",
      quantity: 10,
    },
    {
      id: "M00022",
      name: "Thalappakatti Biryani",
      category: "Biryani",
      vegNonVeg: "non-veg",
      protein: "mutton",
      price: 300,
      tax: 5,
      description: "Authentic South Indian biryani",
      quantity: 10,
    },
    {
      id: "M00023",
      name: "Ghee Rice",
      category: "Rice Dishes",
      vegNonVeg: "veg",
      protein: null,
      price: 150,
      tax: 5,
      description: "Fragrant ghee rice",
      quantity: 10,
    },
    {
      id: "M00024",
      name: "Parotta",
      category: "Side Dish",
      vegNonVeg: "veg",
      protein: null,
      price: 80,
      tax: 5,
      description: "Layered flatbread",
      quantity: 10,
    },
    {
      id: "M00025",
      name: "Naan",
      category: "Side Dish",
      vegNonVeg: "veg",
      protein: null,
      price: 60,
      tax: 5,
      description: "Tandoori bread",
      quantity: 10,
    },
    {
      id: "M00026",
      name: "Garlic Naan",
      category: "Side Dish",
      vegNonVeg: "veg",
      protein: null,
      price: 70,
      tax: 5,
      description: "Naan with garlic",
      quantity: 10,
    },
    {
      id: "M00027",
      name: "Butter Naan",
      category: "Side Dish",
      vegNonVeg: "veg",
      protein: null,
      price: 70,
      tax: 5,
      description: "Buttery tandoori bread",
      quantity: 10,
    },
    {
      id: "M00028",
      name: "Roti",
      category: "Side Dish",
      vegNonVeg: "veg",
      protein: null,
      price: 40,
      tax: 5,
      description: "Whole wheat bread",
      quantity: 10,
    },
    {
      id: "M00029",
      name: "Laccha Parotta",
      category: "Side Dish",
      vegNonVeg: "veg",
      protein: null,
      price: 100,
      tax: 5,
      description: "Crispy layered bread",
      quantity: 10,
    },

    // Thali/Meals
    {
      id: "M00030",
      name: "Non-Veg Thali (Chicken)",
      category: "Snacks",
      vegNonVeg: "non-veg",
      protein: "chicken",
      price: 400,
      tax: 5,
      description: "Complete meal with curry, rice, bread",
      quantity: 10,
    },
    {
      id: "M00031",
      name: "Non-Veg Thali (Mutton)",
      category: "Snacks",
      vegNonVeg: "non-veg",
      protein: "mutton",
      price: 450,
      tax: 5,
      description: "Complete mutton meal",
      quantity: 10,
    },
    {
      id: "M00032",
      name: "Non-Veg Thali (Fish)",
      category: "Snacks",
      vegNonVeg: "non-veg",
      protein: "fish",
      price: 420,
      tax: 5,
      description: "Complete fish meal",
      quantity: 10,
    },
    {
      id: "M00033",
      name: "Veg Thali",
      category: "Snacks",
      vegNonVeg: "veg",
      protein: null,
      price: 280,
      tax: 5,
      description: "Vegetarian complete meal",
      quantity: 10,
    },

    // Beverages
    {
      id: "M00034",
      name: "Lassi",
      category: "Drinks",
      vegNonVeg: "veg",
      protein: null,
      price: 80,
      tax: 5,
      description: "Traditional yogurt drink",
      quantity: 10,
    },
    {
      id: "M00035",
      name: "Mango Lassi",
      category: "Drinks",
      vegNonVeg: "veg",
      protein: null,
      price: 100,
      tax: 5,
      description: "Sweet mango yogurt drink",
      quantity: 10,
    },
    {
      id: "M00036",
      name: "Buttermilk",
      category: "Drinks",
      vegNonVeg: "veg",
      protein: null,
      price: 60,
      tax: 5,
      description: "Cooling yogurt drink",
      quantity: 10,
    },
    {
      id: "M00037",
      name: "Fresh Lemonade",
      category: "Drinks",
      vegNonVeg: "veg",
      protein: null,
      price: 70,
      tax: 5,
      description: "Fresh lime juice",
      quantity: 10,
    },
    {
      id: "M00038",
      name: "Iced Tea",
      category: "Drinks",
      vegNonVeg: "veg",
      protein: null,
      price: 60,
      tax: 5,
      description: "Chilled tea",
      quantity: 10,
    },
    {
      id: "M00039",
      name: "Coffee",
      category: "Drinks",
      vegNonVeg: "veg",
      protein: null,
      price: 80,
      tax: 5,
      description: "Hot coffee",
      quantity: 10,
    },

    // Continental
    {
      id: "M00040",
      name: "Honey Roasted Chicken",
      category: "Main Curries",
      vegNonVeg: "non-veg",
      protein: "chicken",
      price: 320,
      tax: 5,
      description: "Grilled with honey glaze",
      quantity: 10,
    },
    {
      id: "M00041",
      name: "Cajun Spiced Chicken",
      category: "Main Curries",
      vegNonVeg: "non-veg",
      protein: "chicken",
      price: 300,
      tax: 5,
      description: "Spicy American style",
      quantity: 10,
    },
    {
      id: "M00042",
      name: "Grilled Fish Lemon Butter",
      category: "Main Curries",
      vegNonVeg: "non-veg",
      protein: "fish",
      price: 340,
      tax: 5,
      description: "Fresh grilled fish",
      quantity: 10,
    },
    {
      id: "M00043",
      name: "Garlic Butter Prawns",
      category: "Main Curries",
      vegNonVeg: "non-veg",
      protein: "prawns",
      price: 380,
      tax: 5,
      description: "Succulent prawns",
      quantity: 10,
    },

    // Appetizers
    {
      id: "M00044",
      name: "Spring Rolls",
      category: "Snacks",
      vegNonVeg: "veg",
      protein: null,
      price: 120,
      tax: 5,
      description: "Crispy vegetable rolls",
      quantity: 10,
    },
    {
      id: "M00045",
      name: "Samosa",
      category: "Snacks",
      vegNonVeg: "veg",
      protein: null,
      price: 40,
      tax: 5,
      description: "Fried pastry with filling",
      quantity: 10,
    },
    {
      id: "M00046",
      name: "Onion Bhajiya",
      category: "Snacks",
      vegNonVeg: "veg",
      protein: null,
      price: 80,
      tax: 5,
      description: "Fried onion fritters",
      quantity: 10,
    },
    {
      id: "M00047",
      name: "Aloo Tikki",
      category: "Snacks",
      vegNonVeg: "veg",
      protein: null,
      price: 60,
      tax: 5,
      description: "Potato patties",
      quantity: 10,
    },
    {
      id: "M00048",
      name: "Egg Roll",
      category: "Snacks",
      vegNonVeg: "non-veg",
      protein: "egg",
      price: 150,
      tax: 5,
      description: "Crispy egg roll",
      quantity: 10,
    },

    // Desserts
    {
      id: "M00049",
      name: "Gulab Jamun",
      category: "Desserts",
      vegNonVeg: "veg",
      protein: null,
      price: 100,
      tax: 5,
      description: "Sweet milk balls in syrup",
      quantity: 10,
    },
    {
      id: "M00050",
      name: "Kheer",
      category: "Desserts",
      vegNonVeg: "veg",
      protein: null,
      price: 120,
      tax: 5,
      description: "Rice pudding",
      quantity: 10,
    },
    {
      id: "M00051",
      name: "Jalebi",
      category: "Desserts",
      vegNonVeg: "veg",
      protein: null,
      price: 80,
      tax: 5,
      description: "Sweet spiral snack",
      quantity: 10,
    },
  ]

  try {
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(sampleItems))
    console.log("[v0] Initialized 50+ menu items with vegNonVeg and protein fields")
  } catch (error) {
    console.error("[v0] Error initializing sample items:", error)
  }
}

// Data Import/Export
export const dataStorage = {
  exportData: () => {
    const data = {
      menuItems: menuStorage.getAll(),
      bills: billStorage.getAll(),
      profile: profileStorage.get(),
      exportDate: new Date().toISOString(),
    }
    return data
  },

  importData: (data: any): void => {
    try {
      if (data.menuItems) {
        localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(data.menuItems))
      }
      if (data.bills) {
        localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(data.bills))
      }
      if (data.profile) {
        localStorage.setItem(STORAGE_KEYS.RESTAURANT_PROFILE, JSON.stringify(data.profile))
      }
    } catch (error) {
      console.error("[v0] Error importing data:", error)
      throw new Error("Failed to import data")
    }
  },

  downloadBackup: (): void => {
    try {
      const data = dataStorage.exportData()
      const jsonStr = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonStr], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `restaurant-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("[v0] Error downloading backup:", error)
    }
  },

  resetData: (): void => {
    if (!isLocalStorageAvailable()) return
    try {
      localStorage.removeItem(STORAGE_KEYS.MENU_ITEMS)
      localStorage.removeItem(STORAGE_KEYS.BILLS)
      localStorage.removeItem(STORAGE_KEYS.RESTAURANT_PROFILE)
    } catch (error) {
      console.error("[v0] Error resetting data:", error)
    }
  },

  initializeData: (): void => {
    initializeSampleMenuItems()
  },
}
