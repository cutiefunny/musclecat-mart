"use client";

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search } from "lucide-react";
import { useCart } from '@/lib/hooks/useCart';

export function Header() {
    const { items } = useCart();
    const cartCount = items.length;
    const [searchQuery, setSearchQuery] = useState("");
    const pathname = usePathname();
    const router = useRouter();
    const isCartPage = pathname === '/cart';

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        router.push(`/search?query=${searchQuery}`);
    };

    return (
        <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3">
            <div className="flex items-center justify-between gap-4">
                <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                    <Image src='/images/icon.png' alt="Icon" width={32} height={32} />
                    <h1 className="text-lg font-semibold text-foreground hidden sm:block">근육고양이잡화점</h1>
                </Link>
                <div className="flex-1 max-w-lg">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="상품을 검색해보세요..."
                            className="w-full pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Link href="/cart" className="flex items-center">
                            <Button variant="ghost" size="icon">
                                <ShoppingCart className={`h-5 w-5 ${isCartPage ? 'text-primary' : 'text-foreground'}`} />
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