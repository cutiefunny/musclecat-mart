"use client";

import { useSearchParams } from "next/navigation";
import { ShoppingMall } from "@/components/shopping-mall";
import { Suspense } from "react";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  return <ShoppingMall searchQuery={query} />;
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <SearchContent />
    </Suspense>
  );
}