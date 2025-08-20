"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { db, storage } from "@/lib/firebase/clientApp";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { Button } from "@/components/ui/button";
import styles from '../../../admin.module.css';
import Image from "next/image";

// Product 타입을 정의합니다.
interface Product {
    name: string;
    category: string;
    stockQuantity: number;
    description: string;
    options: { name: string; value: string }[];
    price: number;
    show: boolean;
    images: string[];
}

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchProduct = async () => {
            try {
                const docRef = doc(db, "products", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data() as Product;
                    setProduct(data);
                    setExistingImageUrls(data.images || []);
                } else {
                    alert("해당 제품을 찾을 수 없습니다.");
                    router.push('/admin/products');
                }
            } catch (error) {
                console.error("제품 정보 로딩 실패:", error);
            } finally {
                setInitialLoading(false);
            }
        };

        fetchProduct();
    }, [id, router]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        let processedValue: string | number | boolean = value;
        if (type === 'number') {
            processedValue = Number(value);
        } else if (type === 'checkbox') {
            processedValue = (e.target as HTMLInputElement).checked;
        }

        setProduct(prev => prev ? { ...prev, [name]: processedValue } : null);
    };

    const handleOptionChange = (index: number, field: 'name' | 'value', value: string) => {
        if (!product) return;
        const newOptions = [...product.options];
        newOptions[index] = { ...newOptions[index], [field]: value };
        setProduct({ ...product, options: newOptions });
    };

    const addOption = () => {
        if (!product || product.options.length >= 3) return;
        setProduct({ ...product, options: [...product.options, { name: "", value: "" }] });
    };

    const removeOption = (index: number) => {
        if (!product) return;
        const newOptions = product.options.filter((_, i) => i !== index);
        setProduct({ ...product, options: newOptions });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (existingImageUrls.length + files.length > 5) {
                alert("최대 5개의 이미지만 업로드할 수 있습니다.");
                return;
            }
            setNewImages(files);
        }
    };

    const handleDeleteExistingImage = (url: string) => {
        setExistingImageUrls(prev => prev.filter(imageUrl => imageUrl !== url));
        setImagesToDelete(prev => [...prev, url]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;
        
        setLoading(true);

        try {
            // 1. 삭제하기로 한 기존 이미지 Storage에서 삭제
            await Promise.all(
                imagesToDelete.map(url => deleteObject(ref(storage, url)))
            );

            // 2. 새로 추가된 이미지 업로드
            const newImageUrls = await Promise.all(
                newImages.map(async (image) => {
                    const storageRef = ref(storage, `products/${Date.now()}-${image.name}`);
                    await uploadBytes(storageRef, image);
                    return await getDownloadURL(storageRef);
                })
            );

            // 3. 최종 이미지 URL 목록 생성
            const finalImageUrls = [...existingImageUrls, ...newImageUrls];

            // 4. Firestore 문서 업데이트
            const docRef = doc(db, "products", id);
            await updateDoc(docRef, {
                ...product,
                images: finalImageUrls,
                options: product.options.filter(opt => opt.name && opt.value),
            });

            alert("제품이 성공적으로 수정되었습니다.");
            router.push("/admin/products");

        } catch (error) {
            console.error("제품 수정 실패:", error);
            alert("제품 수정 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div>제품 정보를 불러오는 중...</div>;
    }
    
    if (!product) {
        return <div>제품 정보를 표시할 수 없습니다.</div>
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">제품 수정</h1>
            <form onSubmit={handleSubmit} className={styles.formContainer}>
                {/* Form Groups */}
                <div className={styles.formGroup}>
                    <label htmlFor="name" className={styles.label}>제품명</label>
                    <input id="name" name="name" type="text" value={product.name} onChange={handleInputChange} className={styles.input} required />
                </div>
                
                <div className={styles.formGroup}>
                    <label htmlFor="category" className={styles.label}>카테고리</label>
                    <select id="category" name="category" value={product.category} onChange={handleInputChange} className={styles.select} required >
                        <option value="">카테고리를 선택하세요</option>
                        <option value="Plushies">Plushies</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Stickers">Stickers</option>
                        <option value="Pins">Pins</option>
                        <option value="Clothing">Clothing</option>
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="price" className={styles.label}>가격</label>
                    <input id="price" name="price" type="number" value={product.price} onChange={handleInputChange} className={styles.input} required />
                </div>
                
                <div className={styles.formGroup}>
                    <label htmlFor="stockQuantity" className={styles.label}>재고 수량</label>
                    <input id="stockQuantity" name="stockQuantity" type="number" value={product.stockQuantity} onChange={handleInputChange} className={styles.input} />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="description" className={styles.label}>제품 설명</label>
                    <textarea id="description" name="description" value={product.description} onChange={handleInputChange} rows={4} className={styles.textarea} />
                </div>

                {/* Image Management */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>이미지 (최대 5개)</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {existingImageUrls.map(url => (
                            <div key={url} className="relative">
                                <Image src={url} alt="기존 이미지" width={96} height={96} className="w-24 h-24 object-cover rounded-md" />
                                <button type="button" onClick={() => handleDeleteExistingImage(url)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs">&times;</button>
                            </div>
                        ))}
                    </div>
                    <input type="file" multiple accept="image/*" onChange={handleImageChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100" />
                </div>
                
                {/* Options Management */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>옵션 (최대 3개)</label>
                    {product.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2 mt-2">
                            <input type="text" placeholder="옵션명" value={option.name} onChange={(e) => handleOptionChange(index, "name", e.target.value)} className={styles.input} />
                            <input type="text" placeholder="옵션값" value={option.value} onChange={(e) => handleOptionChange(index, "value", e.target.value)} className={styles.input} />
                            <Button type="button" onClick={() => removeOption(index)} variant="destructive" size="sm">삭제</Button>
                        </div>
                    ))}
                    {product.options.length < 3 && <Button type="button" onClick={addOption} className="mt-2" size="sm">옵션 추가</Button>}
                </div>
                
                {/* Show Toggle */}
                <div className="flex items-center">
                    <input id="show" name="show" type="checkbox" checked={product.show} onChange={handleInputChange} className={styles.checkbox} />
                    <label htmlFor="show" className={styles.checkboxLabel}>제품 노출</label>
                </div>
                
                {/* Submit Button */}
                <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>{loading ? '저장 중...' : '제품 수정'}</Button>
                </div>
            </form>
        </div>
    );
}