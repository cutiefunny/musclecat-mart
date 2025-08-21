"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Trash2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/lib/hooks/useCart";

export default function CartPage() {
    const { items: cartItems, removeItem, updateQuantity, saveToFirestore } = useCart();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, []);

    const handleQuantityChange = (cartItemId: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        updateQuantity(cartItemId, newQuantity);
        if (session?.user?.id) {
            saveToFirestore(session.user.id, cartItems);
        }
    };

    const handleRemoveItem = (cartItemId: string) => {
        if (window.confirm("이 상품을 장바구니에서 삭제하시겠습니까?")) {
            removeItem(cartItemId);
            if (session?.user?.id) {
                saveToFirestore(session.user.id, cartItems);
            }
        }
    };

    const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">로딩 중...</div>;
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="p-4 pb-20">
                {cartItems.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                        <p>장바구니가 비어 있습니다.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {cartItems.map(item => (
                            <div key={item.cartItemId} className="flex items-center bg-white p-4 rounded-lg shadow">
                                <Image src={item.image} alt={item.name} width={80} height={80} className="w-20 h-20 object-cover rounded-md mr-4" />
                                <div className="flex-grow">
                                    <h2 className="font-bold">{item.name}</h2>
                                    <div className="text-sm text-gray-500">
                                        {Object.entries(item.options).map(([key, value]) => (
                                            <p key={key}>{key}: {value}</p>
                                        ))}
                                    </div>
                                    <p className="font-semibold mt-1">{item.price.toLocaleString()}원</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="icon" variant="outline" onClick={() => handleQuantityChange(item.cartItemId, item.quantity - 1)}><Minus className="h-4 w-4"/></Button>
                                    <span>{item.quantity}</span>
                                    <Button size="icon" variant="outline" onClick={() => handleQuantityChange(item.cartItemId, item.quantity + 1)}><Plus className="h-4 w-4"/></Button>
                                    <Button size="icon" variant="destructive" onClick={() => handleRemoveItem(item.cartItemId)}><Trash2 className="h-4 w-4"/></Button>
                                </div>
                            </div>
                        ))}

                        <div className="mt-6 pt-6 border-t">
                            <div className="flex justify-between items-center text-xl font-bold">
                                <span>총 주문금액</span>
                                <span>{totalAmount.toLocaleString()}원</span>
                            </div>
                            <Button className="w-full mt-4" size="lg">주문하기</Button>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}