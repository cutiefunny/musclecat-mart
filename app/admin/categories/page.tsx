"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/clientApp";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  DocumentData,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";

// Category 타입 정의
interface Category extends DocumentData {
  id: string;
  name: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  // 카테고리 목록 불러오기
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 카테고리 추가
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      alert("카테고리 이름을 입력해주세요.");
      return;
    }
    try {
      await addDoc(collection(db, "categories"), {
        name: newCategoryName,
        createdAt: serverTimestamp(),
      });
      setNewCategoryName("");
      fetchCategories(); // 목록 새로고침
    } catch (error) {
      console.error("카테고리 추가 실패:", error);
    }
  };

  // 카테고리 수정
  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      alert("카테고리 이름을 입력해주세요.");
      return;
    }
    try {
      const categoryDoc = doc(db, "categories", editingCategory.id);
      await updateDoc(categoryDoc, { name: editingCategory.name });
      setEditingCategory(null);
      fetchCategories(); // 목록 새로고침
    } catch (error) {
      console.error("카테고리 수정 실패:", error);
    }
  };

  // 카테고리 삭제
  const handleDeleteCategory = async (id: string) => {
    if (window.confirm("정말로 이 카테고리를 삭제하시겠습니까?")) {
      try {
        await deleteDoc(doc(db, "categories", id));
        fetchCategories(); // 목록 새로고침
      } catch (error) {
        console.error("카테고리 삭제 실패:", error);
      }
    }
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">카테고리 관리</h1>

      {/* 카테고리 추가 폼 */}
      <div className="mb-6 flex items-center gap-2">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="새 카테고리 이름"
          className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
        <Button onClick={handleAddCategory}>추가</Button>
      </div>

      {/* 카테고리 목록 */}
      <div className="bg-white shadow-md rounded-lg">
        <ul className="divide-y divide-gray-200">
          {categories.map((category) => (
            <li key={category.id} className="p-4 flex items-center justify-between">
              {editingCategory?.id === category.id ? (
                // 수정 모드
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, name: e.target.value })
                    }
                    className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                  <Button onClick={handleUpdateCategory} size="sm">저장</Button>
                  <Button onClick={() => setEditingCategory(null)} variant="outline" size="sm">취소</Button>
                </div>
              ) : (
                // 일반 모드
                <>
                  <span className="text-gray-800">{category.name}</span>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => setEditingCategory(category)} variant="outline" size="sm">수정</Button>
                    <Button onClick={() => handleDeleteCategory(category.id)} variant="destructive" size="sm">삭제</Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}