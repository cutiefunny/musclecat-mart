"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

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
        <Button onClick={() => signIn("google")}>
            <Image src="/google-logo.svg" alt="Google" width={20} height={20} className="mr-2" />
            Sign in with Google
        </Button>
    )
}