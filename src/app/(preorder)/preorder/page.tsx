"use client";
// src/app/(preorder)/preorder/page.tsx

import { useState, useEffect, useCallback } from "react";
import {
  fetchActivity,
  fetchCohorts,
  fetchSpotsStatus,
  ActivityEntry,
  CohortsData,
  SpotsStatus,
  timeAgo,
} from "@/lib/api";

import ActivityBar from "@/components/Preorder/ActivityBar";
import Hero from "@/components/Preorder/Hero";
import TickerStrip from "@/components/Preorder/TickerStrip";
import PerksSection from "@/components/Preorder/PerksSection";
import PreorderModal from "@/components/Preorder/PreorderModal";
import type { PackTier } from "@/components/Preorder/PreorderModal";
import { SuccessModal, Confetti } from "@/components/Preorder/SuccessModal";
import {
  SavingsSection,
  PetWall,
  FeedSection,
  StepsSection,
  PledgeSection,
  FaqSection,
  FinalCTA,
} from "@/components/Preorder/Sections";

interface PaymentResult {
  petName: string;
  ownerName: string;
  cohortNumber: number;
  cohortPosition: number;
  referralCode: string;
  tier: PackTier;
}

const POLL_MS = 30_000;
const SUCCESS_CARD_STORAGE_KEY = "myperro_success_card";

/* ── Live toast ──────────────────────────────────────────────── */
function LiveToast({ activity }: { activity: ActivityEntry[] }) {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<ActivityEntry | null>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (activity.length === 0) return;
    const show = () => {
      setCurrent(activity[idx % activity.length]);
      setVisible(true);
      setTimeout(() => setVisible(false), 4000);
      setIdx((i) => i + 1);
    };
    const first = setTimeout(show, 3000);
    const interval = setInterval(show, 8000);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [activity, idx]);

  if (!current) return null;
  const initials = current.parentName?.charAt(0).toUpperCase() ?? "?";
  const firstName = current.parentName?.split(" ")[0] ?? "Someone";

  return (
    <div
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[600] transition-all duration-500 max-w-[260px] sm:max-w-none ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-3 bg-[#1a1a1a] border border-white/[0.08] rounded-xl px-4 py-3 shadow-2xl">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#E8622A]/20 border border-[#E8622A]/30 flex items-center justify-center shrink-0">
          <span className="font-playfair text-[#E8622A] text-[13px]">
            {initials}
          </span>
        </div>
        <div>
          <p className="text-[12px] sm:text-[13px] text-white/80 font-light leading-[1.3]">
            <span className="font-semibold">{firstName}</span> · {current.city}
          </p>
          <p className="text-[10px] sm:text-[11px] text-white/30 font-light mt-[1px]">
            Reserved spot #{current.position} · {timeAgo(current.claimedAt)}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────── */
export default function PreorderPage() {
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [cohorts, setCohorts] = useState<CohortsData>({
    "cohort 1": [],
    "cohort 2": [],
  });
  const [spots, setSpots] = useState<SpotsStatus>({
    currentCohortNumber: 1,
    claimed: 0,
    total: 20,
    remaining: 20,
    totalPaidOverall: 0,
    lastClaimedAt: "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [succOpen, setSuccOpen] = useState(false);
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [teaserPet, setTeaserPet] = useState("");
  const [selectedTier, setSelectedTier] = useState<PackTier>("starter");
  const [showNav, setShowNav] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [savedFormData, setSavedFormData] = useState({});

  const loadAll = useCallback(async () => {
    const [act, coh, sp] = await Promise.all([
      fetchActivity(20),
      fetchCohorts(),
      fetchSpotsStatus(),
    ]);
    setActivity(act);
    setCohorts(coh);
    setSpots(sp);
  }, []);

  useEffect(() => {
    loadAll();
    const id = setInterval(loadAll, POLL_MS);
    return () => clearInterval(id);
  }, [loadAll]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(SUCCESS_CARD_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<PaymentResult>;
      if (
        !parsed.petName ||
        !parsed.ownerName ||
        !parsed.cohortNumber ||
        !parsed.cohortPosition ||
        !parsed.referralCode
      ) {
        return;
      }
      const restored: PaymentResult = {
        petName: parsed.petName,
        ownerName: parsed.ownerName,
        cohortNumber: parsed.cohortNumber,
        cohortPosition: parsed.cohortPosition,
        referralCode: parsed.referralCode,
        tier: parsed.tier === "founding" ? "founding" : "starter",
      };
      setResult(restored);
      setSuccOpen(false);
    } catch {
      // ignore invalid local storage data
    }
  }, []);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);
      setShowNav(y <= lastY);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSuccess = useCallback(
    async (data: PaymentResult) => {
      setResult(data);
      setModalOpen(false);
      setSuccOpen(true);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SUCCESS_CARD_STORAGE_KEY, JSON.stringify(data));
      }
      setConfetti(true);
      setTimeout(() => setConfetti(false), 5500);
      await loadAll();
    },
    [loadAll],
  );

  const lastClaimed = spots.lastClaimedAt
    ? timeAgo(spots.lastClaimedAt)
    : "recently";
  const openModal = (tier: PackTier = "starter") => {
    setSelectedTier(tier);
    setModalOpen(true);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    ["PRODUCT", "#collar"],
    ["PERKS", "#perks"],
    ["HOW IT WORKS", "#process"],
    ["FOUNDING PACK", "#wall"],
  ];

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen overflow-x-hidden">
      <Confetti show={confetti} />

      {/* ── Navbar ────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          showNav ? "translate-y-0" : "-translate-y-full"
        } ${
          scrolled
            ? "bg-[rgba(10,10,10,0.96)] backdrop-blur-xl border-b border-white/[0.05]"
            : "bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between px-6 sm:px-10 md:px-20 py-4 sm:py-5">
          <img
            src="/myperro-logo.png"
            alt="MyPerro"
            className="h-7 sm:h-11 opacity-85 -ml-1"
          />

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="text-[11px] font-semibold tracking-[2px] text-white/35 hover:text-white/70 transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Spots remaining — desktop only */}
            <span className="hidden sm:block text-[14px] text-white/60 font-light tracking-wide">
              <span className="text-[#E8622A] font-semibold text-[15px]">
                {spots.remaining}
              </span>{" "}
              spots left
            </span>

            {/* Reserve button */}
            <button
              onClick={() =>
                document
                  .getElementById("reserve")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-[#E8622A] text-white font-semibold text-[12px] tracking-wide px-5 sm:px-6 py-[9px] sm:py-[10px] rounded-full transition-opacity hover:opacity-90"
            >
              Reserve Spot
            </button>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex flex-col gap-[5px] p-1"
              aria-label="Menu"
            >
              <span
                className={`block w-5 h-[1.5px] bg-white/50 transition-transform duration-200 ${mobileMenuOpen ? "rotate-45 translate-y-[6.5px]" : ""}`}
              />
              <span
                className={`block w-5 h-[1.5px] bg-white/50 transition-opacity duration-200 ${mobileMenuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`block w-5 h-[1.5px] bg-white/50 transition-transform duration-200 ${mobileMenuOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[rgba(10,10,10,0.98)] backdrop-blur-xl border-t border-white/[0.05] px-6 py-6 flex flex-col gap-6">
            {navLinks.map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-[12px] font-semibold tracking-[2px] text-white/40 hover:text-white/70 transition-colors"
              >
                {label}
              </a>
            ))}
            <div className="pt-2 border-t border-white/[0.05] text-[12px] text-white/20 font-light">
              <span className="text-[#E8622A]">{spots.remaining}</span> spots
              remaining
            </div>
          </div>
        )}
      </header>

      {/* top padding to offset fixed navbar */}
      <div className="pt-[60px] sm:pt-[72px]" />

      {/* ── Sections ──────────────────────────────────────── */}
      <Hero
        claimed={spots.claimed}
        total={spots.total}
        lastClaimed={lastClaimed}
        teaserPet={teaserPet}
        onTeaserChange={setTeaserPet}
        onClaim={() => openModal("starter")}
      />
      <TickerStrip />
      <PerksSection />
      <PetWall
        cohorts={cohorts}
        onClaim={() => openModal("starter")}
        welcomeCard={result}
      />
      <FinalCTA remaining={spots.remaining} onClaim={openModal} />
      <StepsSection />
      <FaqSection />

      {/* Footer */}
      <footer className="bg-[#0a0a0a] border-t border-white/[0.04] py-8 sm:py-10 px-6 sm:px-10 md:px-20">
        <div className="max-w-[1100px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          <img
            src="/myperro-logo.png"
            alt="MyPerro"
            className="h-5 opacity-30"
          />
          <p className="text-[11px] sm:text-[12px] text-white/15 font-light">
            © 2026 MyPerro. myperro.in
          </p>
          <div className="flex gap-5 sm:gap-6">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <a
                key={l}
                href="#"
                className="text-[11px] sm:text-[12px] text-white/20 hover:text-white/40 transition-colors font-light"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>

      <LiveToast activity={activity} />

      {/* Modals */}
      <PreorderModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        seedPet={teaserPet}
        tier={selectedTier}
        savedFormData={savedFormData}
        onFormChange={setSavedFormData}
      />
      {result && (
        <SuccessModal
          open={succOpen}
          onClose={() => setSuccOpen(false)}
          petName={result.petName}
          ownerName={result.ownerName}
          cohortNumber={result.cohortNumber}
          cohortPosition={result.cohortPosition}
          referralCode={result.referralCode}
          tier={result.tier}
        />
      )}
    </div>
  );
}
