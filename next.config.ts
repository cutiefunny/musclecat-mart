import pwa from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https" as const,
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https" as const,
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https" as const,
        hostname: "phinf.pstatic.net",
        port: "",
        pathname: "**",
      },
    ],
  },
};

const withPWA = pwa({
  dest: "public",
  // ⬇️ 아래 주석을 추가하여 TypeScript 오류를 무시합니다.
  // @ts-expect-error
  runtimeCaching: [
    {
      urlPattern: "/",
      handler: "NetworkFirst",
      options: {
        cacheName: "start-url",
        plugins: [
          {
            cacheWillUpdate: ({ response }: { response: Response }) => {
              if (response && (response.status === 200 || response.status === 0)) {
                return response;
              }
              return null;
            },
          },
        ],
      },
    },
  ],
});

export default withPWA(nextConfig);