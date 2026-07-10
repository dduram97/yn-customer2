import type { NextConfig } from "next";

function getSupabaseImagePatterns(): NonNullable<
  NextConfig["images"]
>["remotePatterns"] {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return [];

  try {
    const hostname = new URL(url).hostname;
    return [
      {
        protocol: "https",
        hostname,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: getSupabaseImagePatterns(),
  },
  experimental: {
    // Keep recently visited pages (e.g. home) warm so back navigation feels instant.
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};

export default nextConfig;
