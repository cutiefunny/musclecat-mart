import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Session 인터페이스를 확장하여 user 객체에 id 속성을 추가합니다.
   */
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  /**
   * JWT 인터페이스를 확장하여 토큰에 id를 포함시킵니다.
   */
  interface JWT {
    id?: string;
  }
}