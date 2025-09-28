"use client";
import React, { useState } from "react";

const faqs = [
  {
    question: "What is Uscor Marketplace and who is it for?",
    answer:
      "Uscor Marketplace is a modern commerce platform designed for retailers, restaurants, service providers, and B2B sellers. It offers a unified solution for selling products and services online and in-store, with features like multi-store management, intelligent POS, freelance marketplace, and robust security."
  },
  {
    question: "What hardware is supported by the Intelligent POS?",
    answer:
      "Uscor Intelligent POS works with most industry-standard hardware, including barcode scanners, receipt printers, cash drawers, customer displays, and tablets. The system is compatible with Windows, Android, and iOS devices, and supports USB, Bluetooth, and networked peripherals for seamless integration."
  },
  {
    question: "How does Uscor handle multi-store management?",
    answer:
      "Uscor enables you to manage multiple stores from a single dashboard. You can sync inventory, sales, and worker roles across branches, set localized pricing, and view unified reports. Branch-specific permissions and role overrides ensure each location operates efficiently while maintaining central control."
  },
  {
    question: "Is my business data secure on Uscor?",
    answer:
      "Yes. Uscor uses end-to-end encryption, device checks, rate limiting, and anomaly detection to protect your accounts and transactions. Regular security audits and compliance with industry standards ensure your data is safe and private."
  },
  {
    question: "Can I use Uscor Marketplace offline?",
    answer:
      "Absolutely. Uscor POS supports offline mode, allowing you to continue selling even without an internet connection. All data automatically syncs to the cloud when connectivity resumes, so you never lose a sale."
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "Uscor supports cash, credit/debit cards, mobile money, and Uscor Tokens. The checkout flow is designed for flexibility, letting you accept multiple payment types in one transaction and process discounts or refunds instantly."
  },
  {
    question: "How does inventory management work?",
    answer:
      "Inventory is tracked in real-time across all sales channels and locations. You can set low-stock alerts, create purchase and transfer orders, record stock adjustments, and bulk import/export products via CSV. Composite items and audit logs help you manage complex inventory needs."
  },
  {
    question: "What analytics and reporting features are available?",
    answer:
      "Uscor provides visual dashboards for sales trends, item performance, tax reports, shift and worker productivity, and more. You can export data to CSV or PDF for deeper analysis, and filter reports by date, location, or employee."
  },
  {
    question: "How does Uscor support compliance and KYC?",
    answer:
      "Uscor offers automated identity verification (KYC) to unlock higher limits and trust badges. The platform helps you meet regional regulations with built-in compliance checks, secure data handling, and audit trails."
  },
  {
    question: "Can I integrate my existing hardware or software?",
    answer:
      "Yes. Uscor is designed for easy integration with existing hardware and third-party software. Open APIs and broad device compatibility mean you can connect your current printers, scanners, and business tools without hassle."
  }
];

function AccordionItem({ question, answer, isOpen, onClick }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border-b border-border">
      <button
        className="w-full text-left py-4 px-2 font-semibold text-lg text-foreground focus:outline-none flex justify-between items-center"
        aria-expanded={isOpen}
        onClick={onClick}
      >
        {question}
        <span className="ml-2 text-primary">{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && (
        <div className="pb-6 px-2 text-muted-foreground text-base leading-relaxed animate-fade-in">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-foreground">Frequently Asked Questions</h1>
      <div className="rounded-xl border border-border bg-card shadow-md overflow-hidden">
        {faqs.map((faq, idx) => (
          <AccordionItem
            key={faq.question}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === idx}
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
          />
        ))}
      </div>
    </div>
  );
}
