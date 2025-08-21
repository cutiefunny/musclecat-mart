"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import SignIn from "@/components/SignIn";
import { Button } from "@/components/ui/button";
import { ChevronRight, LogOut, Package } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">로딩 중...</div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center p-4">
            <div className="text-center">
                <p className="text-lg font-semibold mb-4">로그인이 필요합니다.</p>
                <SignIn />
            </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-muted/40 p-4 pb-20">
        <div className="flex items-center gap-4 p-4 bg-card rounded-lg shadow-sm mb-6">
          <Image
            src={session.user?.image || "/images/icon.png"}
            alt={session.user?.name || "User"}
            width={64}
            height={64}
            className="rounded-full"
          />
          <div>
            <h1 className="text-xl font-bold">{session.user?.name}</h1>
            <p className="text-sm text-muted-foreground">{session.user?.email}</p>
          </div>
        </div>

        <div className="space-y-2">
            <Link href="/profile/orders" className="block">
                <div className="flex items-center justify-between p-4 bg-card rounded-lg shadow-sm active:bg-muted">
                    <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-muted-foreground"/>
                        <span className="font-medium">주문 내역</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
            </Link>
            {/* --- ⬇️ 이 부분을 수정했습니다 ⬇️ --- */}
            <Button onClick={() => signOut({ callbackUrl: '/' })} variant="ghost" className="w-full justify-start p-4 bg-card rounded-lg shadow-sm text-destructive font-medium active:bg-muted">
                <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5"/>
                    <span>로그아웃</span>
                </div>
            </Button>
            {/* --- ⬆️ 여기까지 수정 ⬆️ --- */}
        </div>
      </main>
      <Footer />
    </div>
  );
}