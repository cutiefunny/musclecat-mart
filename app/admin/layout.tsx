import Link from "next/link"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-white shadow-md">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-800">Admin</h1>
                </div>
                <nav className="mt-6">
                    <Link href="/admin/users" className="block px-6 py-2.5 text-gray-600 hover:bg-gray-200">회원 관리</Link>
                    <Link href="/admin/products" className="block px-6 py-2.5 text-gray-600 hover:bg-gray-200">제품 관리</Link>
                    <Link href="/admin/categories" className="block px-6 py-2.5 text-gray-600 hover:bg-gray-200">카테고리 관리</Link>
                    <Link href="/admin/orders" className="block px-6 py-2.5 text-gray-600 hover:bg-gray-200">주문 관리</Link>
                    <Link href="/admin/shipping" className="block px-6 py-2.5 text-gray-600 hover:bg-gray-200">배송 관리</Link>
                    <Link href="/admin/banners" className="block px-6 py-2.5 text-gray-600 hover:bg-gray-200">배너 관리</Link>
                </nav>
            </aside>
            <main className="flex-1 p-6">
                {children}
            </main>
        </div>
    )
}