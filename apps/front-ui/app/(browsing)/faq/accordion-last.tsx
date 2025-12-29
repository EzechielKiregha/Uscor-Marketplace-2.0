"use client";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Footer from "@/components/seraui/FooterSection";
import HeaderComponent from "@/components/seraui/HeaderComponent";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

// --- Types ---
interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionIconProps {
  isOpen: boolean;
}

interface AccordionItemProps {
  item: AccordionItem;
  isOpen: boolean;
  onClick: () => void;
}

const accordionData: AccordionItem[] = [
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


const AccordionIcon: React.FC<AccordionIconProps> = ({ isOpen }) => (
  <svg
    className={`w-6 h-6 text-zinc-500 dark:text-zinc-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

const AccordionItem: React.FC<AccordionItemProps> = ({
  item,
  isOpen,
  onClick,
}) => {
  return (
    <div className="border-b border-zinc-200 dark:border-zinc-700 last:border-b-0">
      {/* Header part of the accordion item (Question and Icon) */}
      <button
        className="w-full flex justify-between items-center text-left py-4 px-5 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:ring-opacity-75 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors duration-200"
        onClick={onClick}
        aria-expanded={isOpen}
      >
        <span className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
          {item.question}
        </span>
        <AccordionIcon isOpen={isOpen} />
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-screen" : "max-h-0"
          }`}
      >
        <div className="p-5 pt-0 text-zinc-600 dark:text-zinc-300">
          <p>{item.answer}</p>
        </div>
      </div>
    </div>
  );
};

const AccordionLast: React.FC = () => {
  const path = usePathname();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const handleItemClick = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background  text-foreground">
      <div className="w-full max-w-2xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-lg dark:shadow-zinc-900/20 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* {path === '/' && (
          
        )} */}
        {accordionData.map((item, index) => (
          <AccordionItem
            key={index}
            item={item}
            isOpen={openIndex === index}
            onClick={() => handleItemClick(index)}
          />
        ))}
      </div>
    </div >
  );
};

export default AccordionLast;

