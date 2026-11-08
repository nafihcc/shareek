import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartHandshake,
  MapPinPlus,
  BookOpenCheck,
  Code2,
  Share2,
  Check,
  Copy,
  ArrowUpRight,
  MessageCircle,
  Send,
  QrCode,
  Smartphone,
  X,
} from "lucide-react";

type ContributionType = "masjid" | "sunnah" | "sadaqah" | "code";

const UPI_ID = "nafihcc1234-2@okcici";
const UPI_PAYEE_NAME = "Mohammed Nafih C C";
const UPI_URI = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_PAYEE_NAME)}&tn=${encodeURIComponent("Shareek Sadaqah Jariyah Support")}&cu=INR`;
const UPI_QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=12&color=1f2f57&bgcolor=f7f7fa&data=${encodeURIComponent(UPI_URI)}`;

export function ContributeSection() {
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [activeModal, setActiveModal] = useState<ContributionType | null>(null);
  const [formName, setFormName] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formDetails, setFormDetails] = useState("");

  const handleCopyShare = async () => {
    const shareUrl = window.location.origin + window.location.pathname;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyUpi = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const typeLabels: Record<ContributionType, string> = {
      masjid: "Masjid Submission / Verification",
      sunnah: "Adhkar & Translation Review",
      sadaqah: "Sadaqah Jariyah & Project Support",
      code: "Open-Source Code Contribution",
    };
    const label = activeModal ? typeLabels[activeModal] : "Community Contribution";
    const text = [
      `Assalamu Alaikum! I would like to contribute to *Shareek (شريك)* (${label}):`,
      formName ? `• Name / Title: ${formName}` : "",
      formLocation ? `• City / Coordinates: ${formLocation}` : "",
      formDetails ? `• Details: ${formDetails}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    window.open(
      `https://wa.me/919048291729?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
    setActiveModal(null);
    setFormName("");
    setFormLocation("");
    setFormDetails("");
  };

  return (
    <section
      id="contribute"
      className="relative z-10 max-w-7xl mx-auto px-6 pt-8 pb-12"
    >
      <div className="glass-panel rounded-3xl p-7 sm:p-10">
        {/* Top header row matching hero style */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-hairline">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-panel/80 backdrop-blur-md border border-hairline rounded-full px-4 py-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-gold/60" />
              <span className="text-xs font-semibold text-deep/80 tracking-wide">
                Sadaqah Jariyah · صَدَقَة جَارِيَة
              </span>
            </div>

            <h2 className="mt-4 text-3xl sm:text-4xl font-display font-semibold tracking-tight text-deep leading-[1.1]">
              Contribute to{" "}
              <span className="text-brand relative inline-block">
                Shareek
                <span className="absolute bottom-1 left-0 w-full h-2 bg-gold/25 -z-10 rounded-sm" />
              </span>{" "}
              <span className="font-arabic text-brand/80 font-normal text-2xl sm:text-3xl">
                (شَرِيك)
              </span>
            </h2>

            <p className="mt-3 text-sm sm:text-base text-deep/60 leading-relaxed">
              “When a person dies, their deeds come to an end except for three: ongoing charity{" "}
              <span className="text-deep/80 font-medium">(Sadaqah Jariyah)</span>, beneficial
              knowledge, or a righteous child who prays for them.”{" "}
              <span className="text-deep/45 text-xs">— Sahih Muslim 1631</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCopyShare}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-panel/90 hover:bg-mist border border-hairline text-xs sm:text-sm font-semibold text-deep/80 transition cursor-pointer shadow-2xs"
            >
              {copiedShare ? (
                <>
                  <Check className="w-4 h-4 text-brand" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-brand" />
                  <span>Share Shareek</span>
                </>
              )}
            </button>

            <button
              onClick={() => setActiveModal("sadaqah")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand text-primary-foreground text-xs sm:text-sm font-semibold shadow-md shadow-brand/20 hover:bg-deep transition cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Support via UPI</span>
            </button>
          </div>
        </div>

        {/* 4 Simple Light Contribution Cards matching the top cards */}
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Sadaqah Jariyah UPI Support */}
          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-3xl p-5 bg-panel/85 border border-hairline hover:border-brand/30 transition flex flex-col justify-between shadow-2xs hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="w-11 h-11 rounded-full bg-rose-50 text-rose-600 grid place-items-center">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full bg-mist text-brand">
                  UPI · Sadaqah
                </span>
              </div>
              <h3 className="mt-4 text-base font-display font-semibold text-deep">
                Support Project
              </h3>
              <p className="mt-1 text-xs text-deep/55 leading-relaxed">
                Help keep Shareek ad-free and openly accessible via UPI:
              </p>

              {/* Inline Copyable UPI Badge */}
              <div className="mt-3 flex items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-mist/65 border border-hairline">
                <span className="text-xs font-mono font-medium text-deep truncate select-all">
                  {UPI_ID}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:text-deep transition shrink-0 cursor-pointer"
                  title="Copy UPI ID"
                >
                  {copiedUpi ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-brand" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={() => setActiveModal("sadaqah")}
              className="mt-4 w-full py-2.5 px-3 rounded-full bg-brand text-primary-foreground text-xs font-semibold shadow-2xs hover:bg-deep transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Scan QR / Pay via UPI</span>
            </button>
          </motion.div>

          {/* 2. Submit Masjid */}
          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-3xl p-5 bg-panel/85 border border-hairline hover:border-brand/30 transition flex flex-col justify-between shadow-2xs hover:shadow-md"
          >
            <div>
              <div className="w-11 h-11 rounded-full bg-sky-50 text-sky-600 grid place-items-center">
                <MapPinPlus className="w-5 h-5" />
              </div>
              <h3 className="mt-4 text-base font-display font-semibold text-deep">
                Add a Local Masjid
              </h3>
              <p className="mt-1 text-xs text-deep/55 leading-relaxed">
                Submit verified mosque coordinates, Jumu&apos;ah timings, and prayer facilities in your area.
              </p>
            </div>
            <button
              onClick={() => setActiveModal("masjid")}
              className="mt-5 w-full py-2.5 px-3 rounded-full bg-mist/80 hover:bg-brand hover:text-primary-foreground text-xs font-semibold text-deep transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Submit Masjid</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>

          {/* 3. Verify Adhkar & Translations */}
          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-3xl p-5 bg-panel/85 border border-hairline hover:border-brand/30 transition flex flex-col justify-between shadow-2xs hover:shadow-md"
          >
            <div>
              <div className="w-11 h-11 rounded-full bg-indigo-50 text-indigo-600 grid place-items-center">
                <BookOpenCheck className="w-5 h-5" />
              </div>
              <h3 className="mt-4 text-base font-display font-semibold text-deep">
                Adhkar &amp; Knowledge
              </h3>
              <p className="mt-1 text-xs text-deep/55 leading-relaxed">
                Suggest authentic Duas from Hisn al-Muslim, review Arabic text, or contribute translations.
              </p>
            </div>
            <button
              onClick={() => setActiveModal("sunnah")}
              className="mt-5 w-full py-2.5 px-3 rounded-full bg-mist/80 hover:bg-brand hover:text-primary-foreground text-xs font-semibold text-deep transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Suggest or Review</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>

          {/* 4. Open Source Code */}
          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-3xl p-5 bg-panel/85 border border-hairline hover:border-brand/30 transition flex flex-col justify-between shadow-2xs hover:shadow-md"
          >
            <div>
              <div className="w-11 h-11 rounded-full bg-orange-50 text-orange-600 grid place-items-center">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="mt-4 text-base font-display font-semibold text-deep">
                Open-Source Code
              </h3>
              <p className="mt-1 text-xs text-deep/55 leading-relaxed">
                Contribute features, astronomical calculation refinements, and offline enhancements on GitHub.
              </p>
            </div>
            <a
              href="https://github.com/nafihcc/faiz-sanctuary"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 w-full py-2.5 px-3 rounded-full bg-mist/80 hover:bg-brand hover:text-primary-foreground text-xs font-semibold text-deep transition flex items-center justify-center gap-1.5"
            >
              <span>View GitHub</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </motion.div>
        </div>
      </div>

      {/* Interactive Contribution Modal */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-deep/35 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-3xl bg-panel border border-hairline p-6 sm:p-8 shadow-2xl text-deep"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-brand/70 font-semibold">
                    {activeModal === "sadaqah" ? "Sadaqah Jariyah · صَدَقَة جَارِيَة" : "Community Contribution"}
                  </span>
                  <h3 className="mt-1 text-2xl font-display font-semibold text-deep">
                    {activeModal === "masjid" && "Submit or Verify a Masjid"}
                    {activeModal === "sunnah" && "Suggest Adhkar or Correction"}
                    {activeModal === "sadaqah" && "Support Shareek via UPI"}
                    {activeModal === "code" && "Join as a Contributor"}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-2 rounded-full hover:bg-mist text-deep/60 hover:text-deep transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {activeModal === "sadaqah" ? (
                <div className="mt-6 space-y-5">
                  <div className="rounded-3xl bg-surface border border-hairline p-5 flex flex-col items-center text-center">
                    <div className="p-3 rounded-2xl bg-panel border border-hairline shadow-2xs">
                      <img
                        src={UPI_QR_URL}
                        alt={`UPI QR Code for ${UPI_ID}`}
                        className="w-44 h-44 rounded-lg object-contain"
                      />
                    </div>
                    <p className="mt-3 text-xs font-medium text-deep/55">
                      Scan with Google Pay, PhonePe, Paytm or any UPI App
                    </p>
                    <p className="mt-1 text-sm font-semibold text-deep font-display">
                      {UPI_PAYEE_NAME}
                    </p>

                    <div className="mt-4 w-full flex items-center justify-between gap-2 px-4 py-3 rounded-2xl bg-mist/70 border border-hairline">
                      <div className="text-left">
                        <span className="block text-[10px] uppercase tracking-wider text-deep/50 font-mono">
                          UPI ID
                        </span>
                        <span className="text-sm font-mono font-semibold text-deep select-all">
                          {UPI_ID}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand text-primary-foreground text-xs font-semibold shadow-2xs hover:bg-deep transition cursor-pointer"
                      >
                        {copiedUpi ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy UPI ID</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <a
                      href={UPI_URI}
                      className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-brand text-primary-foreground text-xs font-semibold shadow-md hover:bg-deep transition"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Open UPI App Directly</span>
                    </a>
                    <a
                      href="https://wa.me/919048291729?text=Assalamu%20Alaikum%2C%20I%20contributed%20to%20Shareek%20via%20UPI"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full border border-hairline bg-surface hover:bg-mist text-deep text-xs font-semibold transition"
                    >
                      <MessageCircle className="w-4 h-4 text-brand" />
                      <span>Message on WhatsApp</span>
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleWhatsAppSubmit} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-deep/70 mb-1.5">
                      {activeModal === "masjid"
                        ? "Masjid Name"
                        : activeModal === "sunnah"
                        ? "Your Name & Reference Source"
                        : "Your Name (Optional)"}
                    </label>
                    <input
                      type="text"
                      required={activeModal === "masjid"}
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder={
                        activeModal === "masjid"
                          ? "e.g., Mishkal Masjid, Kuttichira"
                          : "Enter name or Hadith reference..."
                      }
                      className="w-full rounded-2xl bg-surface border border-hairline px-4 py-2.5 text-sm text-deep focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-deep/70 mb-1.5">
                      {activeModal === "masjid"
                        ? "City / Google Maps Link / Coordinates"
                        : activeModal === "sunnah"
                        ? "Category (e.g., Masjid, Morning/Evening, Translation)"
                        : "Contribution Area"}
                    </label>
                    <input
                      type="text"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      placeholder={
                        activeModal === "masjid"
                          ? "e.g., Kozhikode, Kerala or Google Maps URL"
                          : "e.g., Malayalam translation / Hadith verification"
                      }
                      className="w-full rounded-2xl bg-surface border border-hairline px-4 py-2.5 text-sm text-deep focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-deep/70 mb-1.5">
                      {activeModal === "masjid"
                        ? "Jumu'ah Time & Facilities (Wudu, Women's space, Parking)"
                        : "Details / Message"}
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formDetails}
                      onChange={(e) => setFormDetails(e.target.value)}
                      placeholder={
                        activeModal === "masjid"
                          ? "e.g., Jumu'ah Khutbah at 12:30 PM, ample parking..."
                          : "Share the details of your contribution..."
                      }
                      className="w-full rounded-2xl bg-surface border border-hairline px-4 py-2.5 text-sm text-deep focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-4 py-2.5 rounded-full border border-hairline text-xs font-semibold text-deep/70 hover:bg-mist transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand text-primary-foreground text-xs font-semibold shadow-md hover:bg-deep transition cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Contribution via WhatsApp</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
