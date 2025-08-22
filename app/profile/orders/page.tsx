"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // useRouter import 추가
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Order {
    id: string;
    createdAt: Date;
    totalAmount: number;
}

export default function OrdersPage() {
    const { status } = useSession();
    const router = useRouter(); // useRouter 훅 사용
    const [orders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'loading') return; // 로딩 중일때는 대기

        if (status === "unauthenticated") {
            // --- ⬇️ 비로그인 시 프로필 페이지로 리디렉션 ⬇️ ---
            router.push('/profile');
        } else {
            setLoading(false);
        }
    }, [status, router]);

    if (loading || status === 'loading') {
        return <div className="flex justify-center items-center h-screen">로딩 중...</div>;
    }

    if (status === "unauthenticated") {
        return <div className="flex justify-center items-center h-screen">로그인 페이지로 이동 중...</div>;
    }
    
    return (
        <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3">
                <div className="relative flex items-center justify-center">
                    <Link href="/profile" className="absolute left-0">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="text-lg font-semibold">주문 내역</h1>
                </div>
            </header>
            <main className="flex-grow p-4 pb-20">
                {orders.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                        <p>주문 내역이 없습니다.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* 주문 목록 렌더링 (추후 구현) */}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}