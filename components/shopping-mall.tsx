"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Home, Grid3X3, User, Search } from "lucide-react"

const products = [
  {
    id: 1,
    name: "Kawaii Cat Plushie",
    price: "$12.99",
    image: "/kawaii-white-cat-plushie.png",
    category: "Plushies",
    liked: false,
  },
  {
    id: 2,
    name: "Cat Paw Keychain",
    price: "$5.99",
    image: "/placeholder-bdmdv.png",
    category: "Accessories",
    liked: true,
  },
  {
    id: 3,
    name: "Mini Cat Stickers",
    price: "$3.99",
    image: "/kawaii-cat-stickers.png",
    category: "Stickers",
    liked: false,
  },
  {
    id: 4,
    name: "Cat Ear Headband",
    price: "$8.99",
    image: "/pink-kawaii-cat-ears.png",
    category: "Accessories",
    liked: false,
  },
  {
    id: 5,
    name: "Tiny Cat Pin",
    price: "$4.99",
    image: "/cute-kawaii-orange-tabby-enamel-pin.png",
    category: "Pins",
    liked: true,
  },
  {
    id: 6,
    name: "Cat Paw Socks",
    price: "$7.99",
    image: "/cute-cat-paw-socks.png",
    category: "Clothing",
    liked: false,
  },
]

const categories = ["All", "Plushies", "Accessories", "Stickers", "Pins", "Clothing"]

export function ShoppingMall() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [likedProducts, setLikedProducts] = useState(new Set([2, 5]))
  const [cartCount, setCartCount] = useState(0)

  const filteredProducts =
    selectedCategory === "All" ? products : products.filter((product) => product.category === selectedCategory)

  const toggleLike = (productId: number) => {
    const newLiked = new Set(likedProducts)
    if (newLiked.has(productId)) {
      newLiked.delete(productId)
    } else {
      newLiked.add(productId)
    }
    setLikedProducts(newLiked)
  }

  const addToCart = () => {
    setCartCount((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src='/images/icon.png' alt="Icon" className="h-8 w-8" />
            <h1 className="text-lg font-semibold text-foreground">근육고양이잡화점</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4" />
            </Button>
            <div className="relative">
              <Button variant="ghost" size="sm">
                <ShoppingCart className="h-4 w-4" />
              </Button>
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs bg-primary text-primary-foreground">
                  {cartCount}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Category Filter */}
      <div className="px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "secondary"}
              size="sm"
              className="whitespace-nowrap"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-4 pb-20">
        {/* --- ⬇️ grid-cols-5 추가 ⬇️ --- */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-40 object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0 bg-card/80 hover:bg-card"
                    onClick={() => toggleLike(product.id)}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        likedProducts.has(product.id) ? "fill-primary text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </Button>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm text-card-foreground mb-1 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary">{product.price}</span>
                    <Button size="sm" className="h-7 px-3 text-xs" onClick={addToCart}>
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex items-center justify-around py-2">
          <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2">
            <Home className="h-5 w-5 text-primary" />
            <span className="text-xs text-primary">Home</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2">
            <Grid3X3 className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Categories</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2">
            <div className="relative">
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 text-xs bg-primary text-primary-foreground">
                  {cartCount}
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">Cart</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Profile</span>
          </Button>
        </div>
      </nav>
    </div>
  )
}