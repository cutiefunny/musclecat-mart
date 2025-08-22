"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, X } from "lucide-react";
import { db } from "@/lib/firebase/clientApp";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import type { Address } from "@/types";
import DaumPostcode, { Address as DaumAddress } from "react-daum-postcode"; // DaumAddress 타입 import

export default function AddressPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [address, setAddress] = useState<Address>({
        recipient: "",
        phone: "",
        postalCode: "",
        address: "",
        detailAddress: "",
    });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

    useEffect(() => {
        if (status === "loading") return;

        if (status === "authenticated" && session?.user?.id) {
            const fetchAddress = async () => {
                const userRef = doc(db, "users", session.user.id);
                const docSnap = await getDoc(userRef);
                if (docSnap.exists() && docSnap.data().address) {
                    setAddress(docSnap.data().address as Address);
                }
                setLoading(false);
            };
            fetchAddress();
        } else if (status === "unauthenticated") {
            router.push('/profile');
        }
    }, [status, session, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveAddress = async () => {
        if (!session?.user?.id) {
            router.push('/profile');
            return;
        }

        if (!address.recipient || !address.phone || !address.postalCode || !address.address) {
            alert("모든 필수 항목을 입력해주세요.");
            return;
        }

        setIsSaving(true);
        try {
            const userRef = doc(db, "users", session.user.id);
            await updateDoc(userRef, {
                address: address
            });
            alert("배송지 정보가 저장되었습니다.");
        } catch (error) {
            console.error("배송지 저장 실패:", error);
            alert("배송지 저장 중 오류가 발생했습니다.");
        } finally {
            setIsSaving(false);
        }
    };
    
    // --- ⬇️ data 파라미터의 타입을 DaumAddress로 지정합니다 ⬇️ ---
    const handlePostcodeComplete = (data: DaumAddress) => {
        setAddress(prev => ({
            ...prev,
            postalCode: data.zonecode,
            address: data.roadAddress,
        }));
        setIsPostcodeOpen(false);
    };

    const handlePostcodeToggle = () => {
        setIsPostcodeOpen(!isPostcodeOpen);
    };

    if (loading || status === 'loading') {
        return <div className="flex justify-center items-center h-screen">로딩 중...</div>;
    }

    if (status === "unauthenticated") {
        return <div className="flex justify-center items-center h-screen">로그인 페이지로 이동 중...</div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-muted/40">
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
                <div className="space-y-6 bg-card p-6 rounded-lg shadow-sm">
                    <div className="space-y-2">
                        <Label htmlFor="recipient">받는 사람</Label>
                        <Input id="recipient" name="recipient" value={address.recipient} onChange={handleInputChange} placeholder="이름" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">연락처</Label>
                        <Input id="phone" name="phone" type="tel" value={address.phone} onChange={handleInputChange} placeholder="'-' 없이 숫자만 입력" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="postalCode">우편번호</Label>
                        <div className="flex gap-2">
                            <Input id="postalCode" name="postalCode" value={address.postalCode} onChange={handleInputChange} placeholder="우편번호" readOnly className="bg-muted/50" />
                            <Button type="button" variant="outline" onClick={handlePostcodeToggle}>검색</Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">주소</Label>
                        <Input id="address" name="address" value={address.address} onChange={handleInputChange} placeholder="기본 주소" readOnly className="bg-muted/50" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="detailAddress">상세주소</Label>
                        <Input id="detailAddress" name="detailAddress" value={address.detailAddress} onChange={handleInputChange} placeholder="상세 주소를 입력하세요" />
                    </div>

                    <Button onClick={handleSaveAddress} disabled={isSaving} className="w-full" size="lg">
                        {isSaving ? "저장 중..." : "저장하기"}
                    </Button>
                </div>
            </main>

            {isPostcodeOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
                        <div className="flex justify-end p-2">
                           <Button onClick={handlePostcodeToggle} variant="ghost" size="icon" className="rounded-full">
                               <X className="h-5 w-5"/>
                           </Button>
                        </div>
                        <DaumPostcode onComplete={handlePostcodeComplete} style={{ height: "50vh" }} />
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}