import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get("filename");

  if (!filename) {
    return NextResponse.json({ error: "filename required" }, { status: 400 });
  }

  // Vercel Blob handles File objects perfectly
  const blobToken = process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN;

  if (!blobToken) {
    throw new Error(
      "Vercel Blob token is missing. Please configure NEST_PUBLIC_BLOB_READ_WRITE_TOKEN.",
    );
  }

  const blob = await put(`business/kyc-certificates/${filename}`, req.body!, {
    access: "public", // admins only — use 'public' if you need direct URL access
    contentType: "application/pdf",
    addRandomSuffix: false,
    allowOverwrite: true,
    token: blobToken,
  });

  return NextResponse.json({ url: blob.url });
}
