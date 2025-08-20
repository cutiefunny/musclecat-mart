"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Home, Grid3X3, User, Search, X } from "lucide-react"
import { db } from "@/lib/firebase/clientApp"
import { collection, getDocs, query, where, orderBy, DocumentData } from "firebase/firestore"
import Link from "next/link";

// --- ⬇️ 타입 정의 ⬇️ ---
interface ProductOption {
    name: string;
    value: string;
}

interface Product extends DocumentData {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  options: ProductOption[];
}

interface Category extends DocumentData {
    id: string;
    name: string;
}

interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    options: Record<string, string>;
}

// --- ⬇️ 옵션 선택 모달 컴포넌트 ⬇️ ---
function AddToCartModal({ 
    product, 
    onClose, 
    onAddToCart 
}: { 
    product: Product, 
    onClose: () => void, 
    onAddToCart: (selectedOptions: Record<string, string>) => void 
}) {
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

    // 제품의 첫 번째 옵션으로 초기 상태 설정
    useEffect(() => {
        if (product.options && product.options.length > 0) {
            const initialOptions: Record<string, string> = {};
            product.options.forEach(option => {
                const firstValue = option.value.split(',')[0]?.trim();
                if (firstValue) {
                    initialOptions[option.name] = firstValue;
                }
            });
            setSelectedOptions(initialOptions);
        }
    }, [product.options]);
    
    // 옵션이 없는 상품 처리
    if (!product.options || product.options.length === 0) {
        useEffect(() => {
            onAddToCart({}); // 빈 옵션 객체 전달
            onClose();
        }, []);
        return null;
    }

    const handleOptionChange = (optionName: string, value: string) => {
        setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
    };

    const handleConfirm = () => {
        onAddToCart(selectedOptions);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">{product.name}</h2>
                    <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-auto">
                        <X className="w-5 h-5" />
                    </Button>
                </div>
                <div className="space-y-4">
                    {product.options.map((option, index) => (
                        <div key={index}>
                            <label className="text-sm font-medium text-gray-700">{option.name}</label>
                            <select 
                                value={selectedOptions[option.name] || ''}
                                onChange={(e) => handleOptionChange(option.name, e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                                {option.value.split(',').map(val => (
                                    <option key={val.trim()} value={val.trim()}>{val.trim()}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex justify-end">
                    <Button onClick={handleConfirm}>장바구니 담기</Button>
                </div>
            </div>
        </div>
    );
}


export function ShoppingMall() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // --- ⬇️ LocalStorage 연동 로직 추가 ⬇️ ---
  // 컴포넌트 마운트 시 localStorage에서 장바구니 정보 불러오기
  useEffect(() => {
    try {
        const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartCount(cartData.length);
    } catch (e) {
        setCartCount(0);
    }
  }, []);
  
  const addToCart = (product: Product, options: Record<string, string>) => {
    try {
        const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
        
        const newCartItem: CartItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || '',
            quantity: 1,
            options,
        };

        // TODO: 동일 상품 & 동일 옵션일 경우 수량 증가 로직 추가 (현재는 무조건 새로 추가)
        cart.push(newCartItem);

        localStorage.setItem('cart', JSON.stringify(cart));
        setCartCount(cart.length);
        // alert('장바구니에 상품을 담았습니다.');
    } catch(e) {
        alert('장바구니에 상품을 담는 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoryQuery = query(collection(db, "categories"), orderBy("name", "asc"));
        const categorySnapshot = await getDocs(categoryQuery);
        const categoriesData = categorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        setCategories(categoriesData);

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

  const handleAddToCartClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };
  
  const handleConfirmAddToCart = (selectedOptions: Record<string, string>) => {
      if (selectedProduct) {
        addToCart(selectedProduct, selectedOptions);
      }
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setSelectedProduct(null);
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
              <Link href="/cart" className="flex items-center">
                <Button variant="ghost" size="sm">
                  <ShoppingCart className="h-4 w-4" />
                </Button>
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs bg-primary text-primary-foreground">
                    {cartCount}
                  </Badge>
                )}
              </Link>
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
                    <Button size="sm" className="h-7 px-3 text-xs" onClick={() => handleAddToCartClick(product)}>
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
          <Link href="/cart">
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
          </Link>
          <Link href="/profile">
            <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Profile</span>
            </Button>
          </Link>
        </div>
      </nav>

      {/* 모달 렌더링 */}
      {isModalOpen && selectedProduct && (
          <AddToCartModal 
              product={selectedProduct}
              onClose={handleCloseModal}
              onAddToCart={handleConfirmAddToCart}
          />
      )}
    </div>
  )
}