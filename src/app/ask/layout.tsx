import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ask Hiqmah — Hidden Hiqmah",
  description: "Ask questions about Islam with AI-powered answers from authentic sources.",
};

export default function AskLayout({ children }: { children: React.ReactNode }) {
  return children;
}
