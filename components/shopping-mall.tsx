"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { db } from "@/lib/firebase/clientApp"
import { collection, getDocs, query, where, orderBy, DocumentData } from "firebase/firestore"
import { Header } from "./Header"
import { Footer } from "./Footer"

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
    cartItemId: string; // 상품 ID와 옵션을 조합한 고유 ID
    id: string; // 상품 자체의 ID
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
                    {product.options?.map((option, index) => (
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
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const addToCart = (product: Product, options: Record<string, string>) => {
    try {
        const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');

        const optionsIdentifier = Object.keys(options).sort().map(key => `${key}:${options[key]}`).join(',');
        const cartItemId = `${product.id}-${optionsIdentifier}`;

        const existingItemIndex = cart.findIndex(item => item.cartItemId === cartItemId);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            const newCartItem: CartItem = {
                cartItemId,
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images?.[0] || '',
                quantity: 1,
                options,
            };
            cart.push(newCartItem);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated')); // 상태 변경 이벤트 발생
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
    if (!product.options || product.options.length === 0) {
        addToCart(product, {});
    } else {
        setSelectedProduct(product);
        setIsModalOpen(true);
    }
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
      <Header />
      
      <main className="pb-20">
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
        <div className="px-4">
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
      </main>

      <Footer />

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