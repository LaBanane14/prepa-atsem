import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // L'ancien univers /maquette est devenu le site : redirections permanentes (308)
      {
        source: "/maquette",
        destination: "/",
        permanent: true,
      },
      {
        source: "/maquette/:path*",
        destination: "/:path*",
        permanent: true,
      },
      // Les anciennes pages de connexion/inscription mènent au nouvel écran unique
      {
        source: "/login",
        destination: "/auth",
        permanent: true,
      },
      {
        source: "/signup",
        destination: "/auth?mode=signup",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
