"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db, storage } from "@/lib/firebase/clientApp";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  DocumentData,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button } from "@/components/ui/button";
import styles from "../../admin.module.css"; // CSS 모듈 가져오기

// Category 타입 정의
interface Category extends DocumentData {
  id: string;
  name: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [stockQuantity, setStockQuantity] = useState(0);
  const [images, setImages] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState([{ name: "", value: "" }]);
  const [price, setPrice] = useState(0);
  const [show, setShow] = useState(true);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]); // 카테고리 목록 상태 추가

  // Firestore에서 카테고리 목록을 불러옵니다.
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const q = query(collection(db, "categories"), orderBy("name", "asc"));
        const querySnapshot = await getDocs(q);
        const categoriesData = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Category)
        );
        setCategories(categoriesData);
      } catch (error) {
        console.error("카테고리 로딩 실패:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleOptionChange = (index: number, field: string, value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 3) {
      setOptions([...options, { name: "", value: "" }]);
    }
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length > 5) {
        alert("최대 5개의 이미지만 업로드할 수 있습니다.");
        return;
      }
      setImages(files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !price) {
      alert("제품명, 카테고리, 가격은 필수 항목입니다.");
      return;
    }
    setLoading(true);

    try {
      const imageUrls = await Promise.all(
        images.map(async (image) => {
          const storageRef = ref(storage, `products/${Date.now()}-${image.name}`);
          await uploadBytes(storageRef, image);
          return await getDownloadURL(storageRef);
        })
      );

      await addDoc(collection(db, "products"), {
        name,
        category,
        stockQuantity,
        description,
        options: options.filter((opt) => opt.name && opt.value),
        price,
        show,
        images: imageUrls,
        createdAt: serverTimestamp(),
      });

      alert("제품이 성공적으로 등록되었습니다.");
      router.push("/admin/products");
    } catch (error) {
      console.error("제품 등록 실패:", error);
      alert("제품 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">새 제품 등록</h1>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            제품명
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="category" className={styles.label}>
            카테고리
          </label>
          {/* --- ⬇️ 카테고리 select 부분을 동적으로 렌더링 ⬇️ --- */}
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={styles.select}
            required
          >
            <option value="">카테고리를 선택하세요</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="price" className={styles.label}>
            가격
          </label>
          <input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="stockQuantity" className={styles.label}>
            재고 수량
          </label>
          <input
            id="stockQuantity"
            type="number"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(Number(e.target.value))}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            제품 설명
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={styles.textarea}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>이미지 (최대 5개)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>옵션 (최대 3개)</label>
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2 mt-2">
              <input
                type="text"
                placeholder="옵션명 (예: 색상)"
                value={option.name}
                onChange={(e) => handleOptionChange(index, "name", e.target.value)}
                className={styles.input}
              />
              <input
                type="text"
                placeholder="옵션값 (예: 빨강)"
                value={option.value}
                onChange={(e) => handleOptionChange(index, "value", e.target.value)}
                className={styles.input}
              />
              <Button
                type="button"
                onClick={() => removeOption(index)}
                variant="destructive"
                size="sm"
              >
                삭제
              </Button>
            </div>
          ))}
          {options.length < 3 && (
            <Button type="button" onClick={addOption} className="mt-2" size="sm">
              옵션 추가
            </Button>
          )}
        </div>

        <div className="flex items-center">
          <input
            id="show"
            type="checkbox"
            checked={show}
            onChange={(e) => setShow(e.target.checked)}
            className={styles.checkbox}
          />
          <label htmlFor="show" className={styles.checkboxLabel}>
            제품 노출
          </label>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "저장 중..." : "제품 등록"}
          </Button>
        </div>
      </form>
    </div>
  );
}