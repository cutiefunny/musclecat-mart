"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/lib/hooks/useCart";

export default function CartSync() {
  const { data: session, status } = useSession();
  const { syncWithFirestore, fetchFromFirestore } = useCart();

  useEffect(() => {
    if (status === 'authenticated') {
      syncWithFirestore(session.user.id);
    }
  }, [status, session, syncWithFirestore]); // syncWithFirestore 추가

  useEffect(() => {
      const handleStorageChange = () => {
          if (status === 'authenticated' && session?.user?.id) {
              fetchFromFirestore(session.user.id);
          }
      };
      
      window.addEventListener('storage', handleStorageChange);
      return () => {
          window.removeEventListener('storage', handleStorageChange);
      };
  }, [status, session, fetchFromFirestore]); // fetchFromFirestore 추가

  return null;
}