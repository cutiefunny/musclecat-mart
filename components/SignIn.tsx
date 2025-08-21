"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

// Naver Icon SVG Component
const NaverIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.273 12.845H7.727V24H16.273V12.845Z" fill="white"/>
        <path d="M15.3642 0L8.63623 11.1545H16.2732L15.3642 0Z" fill="white"/>
    </svg>
);


export default function SignIn() {
    const { data: session } = useSession()
    if (session) {
        return (
            <>
                Signed in as {session.user?.email} <br />
                <Button onClick={() => signOut()}>Sign out</Button>
            </>
        )
    }
    return (
        <div className="flex flex-col gap-2 w-full max-w-xs">
            <Button onClick={() => signIn("google")} variant="outline" className="w-full">
                <Image src="/google-logo.svg" alt="Google" width={20} height={20} className="mr-2" />
                Sign in with Google
            </Button>
            {/* --- ⬇️ 네이버 로그인 버튼을 추가합니다 ⬇️ --- */}
            <Button onClick={() => signIn("naver")} className="w-full bg-[#03C75A] hover:bg-[#03C75A]/90 text-white">
                <span className="mr-2">
                    <NaverIcon />
                </span>
                Sign in with Naver
            </Button>
            {/* --- ⬆️ 여기까지 추가 ⬆️ --- */}
        </div>
    )
}