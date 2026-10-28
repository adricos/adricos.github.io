import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-6 sm:p-12 md:p-24">
      <main className="flex flex-1 flex-col items-center justify-center text-center max-w-xl mx-auto space-y-8">
        <div className="relative group">
          <div className="relative h-36 w-36 sm:h-44 sm:w-44 overflow-hidden rounded-full ring-4 ring-zinc-200 dark:ring-zinc-800 shadow-xl transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/images/adrian.jpg"
              alt="Adrian Costa"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 144px, 176px"
            />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Adrian Costa
          </h1>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
            Software Developer &amp; Tech Enthusiast
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <a
            href="https://github.com/adricos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-800 dark:text-zinc-200 shadow-sm transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/adriancosta"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-800 dark:text-zinc-200 shadow-sm transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            LinkedIn
          </a>
          <a
            href="mailto:info@adriancosta.com.ar"
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 dark:bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-50 dark:text-zinc-900 shadow-sm transition hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            Contact
          </a>
        </div>
      </main>

      <footer className="w-full text-center py-6 text-xs text-zinc-500 dark:text-zinc-500 flex flex-col sm:flex-row items-center justify-center gap-2">
        <span>&copy; {new Date().getFullYear()} Adrian Costa.</span>
        <span className="hidden sm:inline">&bull;</span>
        <a
          href="/pipe.html"
          className="hover:underline text-zinc-400 dark:text-zinc-600"
        >
          Ceci n&apos;est pas une pipe
        </a>
      </footer>
    </div>
  );
}
