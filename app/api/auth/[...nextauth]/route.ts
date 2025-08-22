import NextAuth, { AuthOptions, SessionStrategy } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import NaverProvider from "next-auth/providers/naver";
import { db } from "@/lib/firebase/clientApp";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"; // getDoc import 추가

const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    NaverProvider({
      clientId: process.env.NAVER_CLIENT_ID as string,
      clientSecret: process.env.NAVER_CLIENT_SECRET as string,
      profile(profile) {
        return {
          id: profile.response.id,
          name: profile.response.name,
          email: profile.response.email,
          image: profile.response.profile_image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (user) {
        try {
          const userRef = doc(db, "users", user.id);
          const docSnap = await getDoc(userRef);

          if (!docSnap.exists()) {
            // 새로운 사용자일 경우 cart 필드를 추가합니다.
            await setDoc(userRef, {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              provider: account?.provider,
              lastLogin: serverTimestamp(),
              cart: [], // 빈 장바구니 필드 추가
            });
          } else {
            // 기존 사용자는 lastLogin만 업데이트합니다.
            await setDoc(userRef, {
              lastLogin: serverTimestamp(),
            }, { merge: true });
          }
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