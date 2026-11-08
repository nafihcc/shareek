import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, ArrowUpRight } from "lucide-react";
import portrait from "@/assets/nafih-portrait.jpg.asset.json";

// GitHub Pages cannot resolve this relative media path on its own domain.
const portraitUrl = `https://shereeq.lovable.app${portrait.url}`;

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Mohammed Nafih C C | Shareek" },
      { name: "description", content: "Meet Mohammed Nafih C C, the person behind Shareek. Get in touch on WhatsApp." },
      { property: "og:title", content: "About Mohammed Nafih C C | Shareek" },
      { property: "og:description", content: "Meet Mohammed Nafih C C, the person behind Shareek. Get in touch on WhatsApp." },
      { property: "og:image", content: portraitUrl },
      { name: "twitter:image", content: portraitUrl },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 pt-10 pb-20">
      <div className="border-t border-deep/15 pt-5 flex items-center justify-between text-xs font-semibold uppercase text-brand">
        <span>Shareek / About</span>
        <span>01 — The person behind it</span>
      </div>
      <div className="mt-10 grid md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] gap-10 lg:gap-16 items-start">
        <div className="order-2 md:order-1 flex flex-col items-start md:pt-6 lg:pt-10">
          <p className="text-sm font-semibold text-gold uppercase">About us</p>
          <h1 className="mt-5 text-5xl sm:text-6xl lg:text-7xl leading-[1.08] font-semibold text-deep break-words">
            Mohammed<br className="hidden sm:block" /> Nafih C C
          </h1>
          <div className="mt-8 w-16 h-px bg-gold" />
          <p className="mt-8 text-lg leading-relaxed text-deep/70 max-w-lg">
            The person behind Shareek — a place for prayer times, Quran reading, finding the Qibla and keeping up with daily dhikr.
          </p>
          <a
            href="https://wa.me/919048291729"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center gap-3 bg-brand text-primary-foreground px-5 py-3 font-semibold text-sm hover:bg-deep transition-colors rounded-sm"
          >
            <MessageCircle size={19} aria-hidden="true" /> Message on WhatsApp <ArrowUpRight size={17} aria-hidden="true" />
          </a>
          <p className="mt-3 text-sm text-deep/55">+91 90482 91729</p>
        </div>
        <div className="order-1 md:order-2">
          <div className="aspect-[4/4.1] w-full max-h-[650px] overflow-hidden bg-mist">
            <img src={portraitUrl} alt="Mohammed Nafih C C" className="w-full h-full object-cover object-[37%_center]" />
          </div>
          <p className="mt-3 text-xs text-deep/55">Mohammed Nafih C C</p>
        </div>
      </div>
    </main>
  );
}