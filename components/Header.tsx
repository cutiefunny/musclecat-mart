"use client";

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Search } from "lucide-react";

interface CartItem {
    cartItemId: string;
}

export function Header() {
    const [cartCount, setCartCount] = useState(0);
    const pathname = usePathname();
    const isCartPage = pathname === '/cart';

    useEffect(() => {
        const updateCartCount = () => {
            const cartData: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
            setCartCount(cartData.length);
        };

        updateCartCount();

        // 다른 탭이나 창에서 storage가 변경될 때 cartCount를 업데이트합니다.
        window.addEventListener('storage', updateCartCount);
        // 동일 탭 내에서 cart가 업데이트될 때 custom event를 통해 cartCount를 업데이트합니다.
        window.addEventListener('cartUpdated', updateCartCount);

        return () => {
            window.removeEventListener('storage', updateCartCount);
            window.removeEventListener('cartUpdated', updateCartCount);
        };
    }, []);

    return (
        <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3">
            <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Image src='/images/icon.png' alt="Icon" width={32} height={32} />
                    <h1 className="text-lg font-semibold text-foreground">근육고양이잡화점</h1>
                </Link>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                        <Search className="h-4 w-4" />
                    </Button>
                    <div className="relative">
                        <Link href="/cart" className="flex items-center">
                            <Button variant="ghost" size="sm">
                                <ShoppingCart className={`h-4 w-4 ${isCartPage ? 'text-primary' : 'text-foreground'}`} />
                            </Button>
                            {cartCount > 0 && (
                                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs bg-primary text-primary-foreground flex items-center justify-center">
                                    {cartCount}
                                </Badge>
                            )}
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}