import withPWA from "@ducanh2912/next-pwa";

const nextConfig = {
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

export default withPWA({
  dest: "public",
})(nextConfig);