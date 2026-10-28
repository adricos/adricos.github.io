import type { Metadata } from "next";
import { MagritteLightningPipe } from "./magritte-lightning-pipe";

export const metadata: Metadata = {
  title: "Ceci n'est pas une pipe | Adrian Costa",
  description: "Ceci n'est pas une pipe",
};

export default function PipePage() {
  return (
    <main className="fixed inset-0 h-screen w-screen overflow-hidden bg-zinc-950 p-4 sm:p-8 md:p-12">
      <MagritteLightningPipe />
    </main>
  );
}
