"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase/clientApp";
import { collection, getDocs, query, orderBy, DocumentData, Timestamp } from "firebase/firestore";

// Product 타입을 정의합니다.
interface Product extends DocumentData {
    id: string;
    name: string;
    category: string;
    price: number;
    stockQuantity: number;
    show: boolean;
    createdAt: Timestamp; // any 대신 Timestamp 타입 사용
}

export default function ProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const productsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Product));
                setProducts(productsData);
            } catch (error) {
                console.error("제품 목록 로딩 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleAddProduct = () => {
        router.push('/admin/products/add');
    };

    const handleEditProduct = (id: string) => {
        router.push(`/admin/products/edit/${id}`);
    };

    if (loading) {
        return <div>로딩 중...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">제품 관리</h1>
                <Button onClick={handleAddProduct}>등록</Button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제품명</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가격</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">재고</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">노출 상태</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">편집</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{product.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{product.price.toLocaleString()}원</td>
                                <td className="px-6 py-4 whitespace-nowrap">{product.stockQuantity}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        product.show ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {product.show ? '노출' : '숨김'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Button variant="outline" size="sm" onClick={() => handleEditProduct(product.id)}>
                                        편집
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}