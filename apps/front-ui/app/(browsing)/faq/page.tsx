"use client";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import HeaderComponent from "@/components/seraui/HeaderComponent";
import React, { useState } from "react";
import AccordionLast from "./accordion-last";
import Footer from "@/components/seraui/FooterSection";


const FaqPage: React.FC = () => {

  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-gray-950 text-foreground">
      <HeaderComponent />
      <MaxWidthWrapper>
        <div className="py-8 mx-auto text-center flex flex-col items-center max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-foreground">
            Frequently Asked {' '}
            <span className="text-primary">Questions</span>
          </h1>
          <p className="mt-6 text-lg max-w-prose text-muted-foreground">
            Here are some of our most asked questions..
          </p>
        </div>
        <AccordionLast />
      </MaxWidthWrapper>
      <Footer />
    </div >
  );
};

export default FaqPage;

