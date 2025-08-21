import NextAuth, { AuthOptions, SessionStrategy } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { db } from "@/lib/firebase/clientApp"; 
import { doc, setDoc, serverTimestamp } from "firebase/firestore"; 

const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    // --- ⬇️ 'profile' 파라미터를 제거했습니다 ⬇️ ---
    async signIn({ user, account }) {
      if (user) {
        try {
          const userRef = doc(db, "users", user.id);
          await setDoc(userRef, {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            provider: account?.provider,
            lastLogin: serverTimestamp(), 
          }, { merge: true }); 
        } catch (error) {
          console.error("Firestore user save error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }