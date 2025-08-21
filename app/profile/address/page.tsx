"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/firebase/clientApp";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { Address } from "@/types";

export default function AddressPage() {
    const { data: session, status } = useSession();
    const [address, setAddress] = useState<Address>({
        recipient: "",
        phone: "",
        postalCode: "",
        address: "",
        detailAddress: "",
    });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (status === "authenticated" && session?.user?.id) {
            const fetchAddress = async () => {
                const addressRef = doc(db, "addresses", session.user.id);
                const docSnap = await getDoc(addressRef);
                if (docSnap.exists()) {
                    setAddress(docSnap.data() as Address);
                }
                setLoading(false);
            };
            fetchAddress();
        } else if (status === "unauthenticated") {
            setLoading(false);
        }
    }, [status, session]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveAddress = async () => {
        if (!session?.user?.id) {
            alert("로그인이 필요합니다.");
            return;
        }

        if (!address.recipient || !address.phone || !address.postalCode || !address.address) {
            alert("모든 필수 항목을 입력해주세요.");
            return;
        }

        setIsSaving(true);
        try {
            const addressRef = doc(db, "addresses", session.user.id);
            await setDoc(addressRef, address);
            alert("배송지 정보가 저장되었습니다.");
        } catch (error) {
            console.error("배송지 저장 실패:", error);
            alert("배송지 저장 중 오류가 발생했습니다.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">로딩 중...</div>;
    }

    if (status === "unauthenticated") {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>로그인이 필요합니다.</p>
            </div>
        );
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
                    <h1 className="text-lg font-semibold">배송지 관리</h1>
                </div>
            </header>

            <main className="flex-grow p-4 pb-20">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="recipient">받는 사람</Label>
                        <Input id="recipient" name="recipient" value={address.recipient} onChange={handleInputChange} placeholder="이름" />
                    </div>
                    <div>
                        <Label htmlFor="phone">연락처</Label>
                        <Input id="phone" name="phone" type="tel" value={address.phone} onChange={handleInputChange} placeholder="'-' 없이 숫자만 입력" />
                    </div>
                    <div>
                        <Label htmlFor="postalCode">우편번호</Label>
                        <div className="flex gap-2">
                            <Input id="postalCode" name="postalCode" value={address.postalCode} onChange={handleInputChange} placeholder="우편번호" readOnly />
                            <Button type="button" variant="outline" onClick={() => alert('우편번호 검색 기능은 준비 중입니다.')}>검색</Button>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="address">주소</Label>
                        <Input id="address" name="address" value={address.address} onChange={handleInputChange} placeholder="기본 주소" readOnly />
                    </div>
                    <div>
                        <Label htmlFor="detailAddress">상세주소</Label>
                        <Input id="detailAddress" name="detailAddress" value={address.detailAddress} onChange={handleInputChange} placeholder="상세 주소를 입력하세요" />
                    </div>

                    <Button onClick={handleSaveAddress} disabled={isSaving} className="w-full">
                        {isSaving ? "저장 중..." : "저장하기"}
                    </Button>
                </div>
            </main>

            <Footer />
        </div>
    );
}