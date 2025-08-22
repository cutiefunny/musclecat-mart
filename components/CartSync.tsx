"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/lib/hooks/useCart";

export default function CartSync() {
  const { data: session, status } = useSession();
  const { fetchCart } = useCartStore();

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchCart(session.user.id);
    }
  }, [status, session, fetchCart]);

  return null;
}