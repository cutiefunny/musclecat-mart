import { DocumentData } from "firebase/firestore";

export interface ProductOption {
    name: string;
    value: string;
}

export interface Product extends DocumentData {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  options: ProductOption[];
}

export interface CartItem {
    cartItemId: string; // 상품 ID와 옵션을 조합한 고유 ID
    id: string; // 상품 자체의 ID
    name: string;
    price: number;
    image: string;
    quantity: number;
    options: Record<string, string>;
}

export interface Category extends DocumentData {
    id: string;
    name: string;
    description: string;
    image: string;
}

export interface Address {
    recipient: string;
    phone: string;
    postalCode: string;
    address: string;
    detailAddress: string;
}