"use client";
import Footer from "@/components/seraui/FooterSection";
import HeaderComponent from "@/components/seraui/HeaderComponent";
import { Button } from "@/components/ui/button";
import { Frown } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function NotFoundPage() {
  return (

    <div className="flex flex-col items-center bg-background text-foreground">
      {/* Header */}
      <HeaderComponent />
      <div className="flex flex-col min-h-screen justify-center items-center w-full max-w-lg bg-background px-4 text-center">
        <div className="flex items-center gap-x-2 mb-3">
          <Frown className="size-6 text-muted-foreground" />
          <span className="font-bold text-xl">Not Found</span>
        </div>
        <p className="text-muted-foreground text-lg">
          Could not find requested resources
        </p>
        <Link href="/">
          <Button variant={"outline"} className="mt-1 cursor-pointer">
            Return Home
          </Button>
        </Link>
      </div>
      <Footer />
    </div>

  );
}