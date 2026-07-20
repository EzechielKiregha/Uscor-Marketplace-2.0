import Link from "next/link";
import { ArrowRight } from "lucide-react";

function FreelanceHero() {
  return (
    <section className="relative py-20 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-1/4 w-[500px] h-[400px] rounded-full bg-orange-500/8 dark:bg-orange-500/5 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 w-[300px] h-[250px] rounded-full bg-amber-500/5 dark:bg-amber-500/3 blur-[80px]" />
      </div>

      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/40 rounded-full border border-orange-200 dark:border-orange-800/50 mb-6">
          Freelance Marketplace
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-[1.1] tracking-tight">
          Find Expert{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-500">
            Freelancers
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Hire vetted professionals or offer your services. Milestones,
          contracts, escrow, and instant payouts — all on USCOR.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/freelance-gigs?tab=browse"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium shadow-lg shadow-orange-600/20 transition-all"
          >
            Browse Services
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/freelance-gigs?tab=post"
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg font-medium text-foreground hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all"
          >
            Post a Gig
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FreelanceHero;
