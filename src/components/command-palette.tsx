"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "About" | "Easter Egg";
  shortcut?: string;
  action: () => void;
  description?: string;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [quote, setQuote] = useState<string | null>(null);
  const router = useRouter();

  // Keybindings for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const quotes = useMemo(
    () => [
      "Ceci n'est pas une pipe. — René Magritte",
      "Simplicity is prerequisite for reliability. — Edsger Dijkstra",
      "The best code is the code that was never written.",
      "First, solve the problem. Then, write the code. — John Johnson",
    ],
    []
  );

  const commands: CommandItem[] = useMemo(() => {
    return [
      {
        id: "github",
        title: "Visit GitHub Profile",
        category: "Navigation",
        shortcut: "GH",
        description: "Explore repositories, code, and contributions (@adricos)",
        action: () => {
          window.open("https://github.com/adricos", "_blank", "noopener,noreferrer");
          setIsOpen(false);
        },
      },
      {
        id: "linkedin",
        title: "Connect on LinkedIn",
        category: "Navigation",
        shortcut: "IN",
        description: "Professional background, career history & network",
        action: () => {
          window.open("https://www.linkedin.com/in/adriancosta", "_blank", "noopener,noreferrer");
          setIsOpen(false);
        },
      },
      {
        id: "email",
        title: "Send an Email",
        category: "Navigation",
        shortcut: "EM",
        description: "info@adriancosta.com.ar",
        action: () => {
          window.location.href = "mailto:info@adriancosta.com.ar";
          setIsOpen(false);
        },
      },
      {
        id: "copy-email",
        title: "Copy Email Address",
        category: "About",
        description: "Copy info@adriancosta.com.ar to clipboard",
        action: () => {
          navigator.clipboard.writeText("info@adriancosta.com.ar");
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        },
      },
      {
        id: "pipe",
        title: "The Treachery of Images (Pipe)",
        category: "Easter Egg",
        shortcut: "PIPE",
        description: "Ceci n'est pas une pipe — surrealist vector canvas",
        action: () => {
          setIsOpen(false);
          router.push("/pipe");
        },
      },
      {
        id: "random-quote",
        title: "Inspire Me / Random Philosophy",
        category: "About",
        description: "Get a random software or philosophical reflection",
        action: () => {
          const random = quotes[Math.floor(Math.random() * quotes.length)];
          setQuote(random);
        },
      },
      {
        id: "location",
        title: "Current Base & Timezone",
        category: "About",
        description: "Buenos Aires, Argentina (UTC-3)",
        action: () => {
          alert(`Adrian Costa is based in Buenos Aires, Argentina.\nTimezone: America/Argentina/Buenos_Aires (UTC-3).`);
        },
      },
    ];
  }, [quotes, router]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const lower = query.toLowerCase();
    return commands.filter(
      (c) =>
        c.title.toLowerCase().includes(lower) ||
        c.description?.toLowerCase().includes(lower) ||
        c.category.toLowerCase().includes(lower)
    );
  }, [commands, query]);

  const handleKeyDownInList = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
      e.preventDefault();
      filteredCommands[selectedIndex].action();
    }
  };

  return (
    <>
      {/* Subtle trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 backdrop-blur-sm shadow-sm transition hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-200"
        title="Open command palette"
        aria-label="Open command palette"
      >
        <span className="font-mono text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 font-semibold group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition">
          ⌘K
        </span>
        <span className="hidden sm:inline">Commands</span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:pt-24 bg-zinc-950/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDownInList}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3.5">
              <span className="text-zinc-400 dark:text-zinc-500 font-mono text-sm">~$</span>
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none"
              />
              <kbd className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                ESC
              </kbd>
            </div>

            {/* Quote banner if triggered */}
            {quote && (
              <div className="px-4 py-2.5 bg-zinc-100/80 dark:bg-zinc-800/80 text-xs italic text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <span>&ldquo;{quote}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => setQuote(null)}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs ml-2"
                >
                  &times;
                </button>
              </div>
            )}

            {/* Notification message */}
            {copied && (
              <div className="px-4 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs text-center border-b border-emerald-500/20">
                Copied email to clipboard!
              </div>
            )}

            {/* Command List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredCommands.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
                  No matching commands found.
                </div>
              ) : (
                filteredCommands.map((command, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={command.id}
                      type="button"
                      onClick={command.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors ${
                        isSelected
                          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">{command.title}</div>
                        {command.description && (
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            {command.description}
                          </div>
                        )}
                      </div>
                      {command.shortcut && (
                        <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 bg-zinc-200/50 dark:bg-zinc-700/50 px-1.5 py-0.5 rounded">
                          {command.shortcut}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Palette Footer */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 px-4 py-2 bg-zinc-50 dark:bg-zinc-950/50 flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
              <span>Use &uarr; &darr; to navigate</span>
              <span>&crarr; to select</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
