"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Grid3X3, User, ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/hooks/useCart';

export function Footer() {
    const { items } = useCart();
    const cartCount = items.length;
    const pathname = usePathname();

    const navItems = [
        { href: '/', icon: Home, label: 'Home' },
        { href: '/categories', icon: Grid3X3, label: 'Categories' },
        { href: '/cart', icon: ShoppingCart, label: 'Cart' },
        { href: '/profile', icon: User, label: 'Profile' },
    ];
    
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
            <div className="flex items-center justify-around py-2">
                {navItems.map((item) => {
                    const isActive = item.href === '/categories' ? false : pathname === item.href;
                    const Icon = item.icon;
                    const linkHref = item.href === '/categories' ? '#' : item.href;

                    return (
                        <Link href={linkHref} key={item.label}>
                            <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2">
                                <div className="relative">
                                    <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                                    {item.href === '/cart' && cartCount > 0 && (
                                        <Badge className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 text-xs bg-primary text-primary-foreground flex items-center justify-center">
                                            {cartCount}
                                        </Badge>
                                    )}
                                </div>
                                <span className={`text-xs ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {item.label}
                                </span>
                            </Button>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}