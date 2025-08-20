"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Home, Grid3X3, User, Search } from "lucide-react"
import { db } from "@/lib/firebase/clientApp"
import { collection, getDocs, query, where, orderBy, DocumentData } from "firebase/firestore"

// 타입 정의
interface Product extends DocumentData {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
}

interface Category extends DocumentData {
    id: string;
    name: string;
}


export function ShoppingMall() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 카테고리 데이터 가져오기
        const categoryQuery = query(collection(db, "categories"), orderBy("name", "asc"));
        const categorySnapshot = await getDocs(categoryQuery);
        const categoriesData = categorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        setCategories(categoriesData);

        // 제품 데이터 가져오기 (show가 true인 것만)
        const productQuery = query(collection(db, "products"), where("show", "==", true), orderBy("createdAt", "desc"));
        const productSnapshot = await getDocs(productQuery);
        const productsData = productSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Product));
        setProducts(productsData);

      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  const addToCart = () => {
    setCartCount((prev) => prev + 1);
  };

  if (loading) {
      return <div className="flex justify-center items-center h-screen">로딩 중...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src='/images/icon.png' alt="Icon" width={32} height={32} />
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
            <Button
              key="All"
              variant={selectedCategory === "All" ? "default" : "secondary"}
              size="sm"
              className="whitespace-nowrap"
              onClick={() => setSelectedCategory("All")}
            >
              All
            </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.name ? "default" : "secondary"}
              size="sm"
              className="whitespace-nowrap"
              onClick={() => setSelectedCategory(category.name)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-4 pb-20">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <Image
                    src={product.images?.[0] || "/placeholder.svg"}
                    alt={product.name}
                    width={200}
                    height={160}
                    className="w-full h-40 object-cover"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm text-card-foreground mb-1 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary">{product.price.toLocaleString()}원</span>
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