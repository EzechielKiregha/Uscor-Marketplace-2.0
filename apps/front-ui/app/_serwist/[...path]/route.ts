import { createSerwistRoute } from "@serwist/turbopack";

export const dynamic = "force-dynamic";

const revision = "dev";

export const { dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    additionalPrecacheEntries: [{ url: "/~offline", revision }],
    swSrc: "app/sw.ts",
    useNativeEsbuild: true,
  });
