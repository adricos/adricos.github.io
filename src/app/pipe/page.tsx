import type { Metadata } from "next";
import Link from "next/link";
import { PipeSvg } from "./pipe-svg";

export const metadata: Metadata = {
  title: "Ceci n'est pas une pipe | Adrian Costa",
  description: "Ceci n'est pas une pipe",
};

export default function PipePage() {
  return (
    <main className="fixed inset-0 h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-8 md:p-12">
      <Link
        href="/"
        className="flex h-full w-full items-center justify-center cursor-default"
        title="Back to home"
      >
        <PipeSvg className="h-full w-full max-h-full max-w-full object-contain text-zinc-900 dark:text-zinc-100 transition-transform duration-300 hover:scale-[1.01]" />
      </Link>
    </main>
  );
}
