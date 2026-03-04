"use client";
// src/components/Preorder/SuccessModal.tsx

import { useState } from "react";
import { downloadWelcomeCard, shareWelcomeCard } from "@/lib/welcomeCard";

export function Confetti({ show }: { show: boolean }) {
  if (!show) return null;
  const colors = ["#FF6600", "#FF8533", "#fff", "#FFD700", "#FF6B6B"];
  return (
    <>
      {Array.from({ length: 70 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: colors[i % colors.length],
        w: Math.random() * 10 + 5,
        h: Math.random() * 10 + 5,
        delay: Math.random() * 1.4,
        dur: Math.random() * 2 + 2.5,
        round: i % 2 === 0,
      })).map((p) => (
        <div
          key={p.id}
          className="fixed pointer-events-none z-[900]"
          style={{
            left: `${p.left}vw`,
            top: -20,
            width: p.w,
            height: p.h,
            background: p.color,
            borderRadius: p.round ? "50%" : 2,
            animation: `confettiFall ${p.dur}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </>
  );
}

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  petName: string;
  ownerName: string;
  cohortNumber: number;
  cohortPosition: number;
  referralCode: string;
  tier: "starter" | "founding";
}

export function SuccessModal({
  open,
  onClose,
  petName,
  ownerName,
  cohortNumber,
  cohortPosition,
  referralCode,
  tier,
}: SuccessModalProps) {
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [sharingImage, setSharingImage] = useState(false);
  const [sharingWA, setSharingWA] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [waError, setWaError] = useState("");

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://myperro.in";
  const url = `${origin}/preorder?ref=${encodeURIComponent(referralCode)}`;

  const cardTitle = "Welcome to the Founding Pack!!";
  const cardBody =
    tier === "founding"
      ? "You're officially a key member of the MyPerro journey. Your generous support not only guarantees you priority shipping from our first batch, but also unlocks exclusive benefits only for our Founding Members."
      : "You're officially part of the MyPerro journey. Your support not only guarantees you early shipping from our first batch, but also unlocks benefits.";
  const cardFooter =
    "Welcome to the heart of the community. Let's create the future of smart pet care, together.";
  const teamLine = `-Team MyPerro ${"\u{1F43E}"}`;

  const shareMsg = `${cardTitle}\n\n${cardBody}\n\n${cardFooter}\n\n${teamLine}\n\nReferral code: ${referralCode}\n${url}`;

  const copyCode = () => {
    navigator.clipboard?.writeText(referralCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const shareWA = async () => {
    try {
      setWaError("");
      setSharingWA(true);
      await shareWelcomeCard({
        petName,
        ownerName,
        cohortNumber,
        cohortPosition,
        referralCode,
        tier,
      });
    } catch {
      setWaError("Your device/browser does not support image sharing.");
    } finally {
      setSharingWA(false);
    }
  };

  const downloadCard = async () => {
    try {
      setDownloading(true);
      await downloadWelcomeCard({
        petName,
        ownerName,
        cohortNumber,
        cohortPosition,
        referralCode,
        tier,
      });
    } finally {
      setDownloading(false);
    }
  };

  const shareImageCard = async () => {
    try {
      setSharingImage(true);
      await shareWelcomeCard({
        petName,
        ownerName,
        cohortNumber,
        cohortPosition,
        referralCode,
        tier,
      });
    } finally {
      setSharingImage(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[800] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#161616] border border-[rgba(255,102,0,0.2)] rounded-2xl p-12 max-w-[560px] w-full relative text-center po-modal-in max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-5 bg-transparent border-none text-white/40 text-[22px] hover:text-white transition-colors"
        >
          x
        </button>

        <div className="text-[56px] mb-2">{"\u{1F43E}"}</div>

        <div className="inline-flex items-center gap-3 mb-4">
          <div className="bg-[rgba(255,102,0,0.1)] border border-[rgba(255,102,0,0.3)] rounded-full px-4 py-1 text-[11px] font-bold text-[#FF6600] uppercase tracking-[2px]">
            Cohort {cohortNumber}
          </div>
          <div className="font-bebas text-[72px] text-[#FF6600] leading-none">
            #{cohortPosition}
          </div>
        </div>

        <h3 className="font-bebas text-[32px] mb-3">{cardTitle}</h3>
        <p className="text-[14px] text-white/70 leading-[1.8] max-w-[420px] mx-auto">
          {cardBody}
        </p>
        <p className="text-[14px] text-white/70 leading-[1.8] max-w-[420px] mx-auto mt-3">
          {cardFooter}
        </p>
        <p className="text-[14px] text-white mt-4">{teamLine}</p>

        <p className="text-[12px] text-white/35 mt-4">
          <strong className="text-white">{petName}</strong> with <strong className="text-white">{ownerName}</strong> | Cohort {cohortNumber} | Spot #{cohortPosition}
        </p>

        <div className="mt-7 bg-[rgba(255,102,0,0.07)] border border-[rgba(255,102,0,0.2)] rounded-xl p-5">
          <p className="text-[11px] font-bold uppercase tracking-[2px] text-[#FF6600] mb-2">
            Your Referral Code
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="font-bebas text-[28px] tracking-[4px] text-white">{referralCode}</span>
            <button
              onClick={copyCode}
              className="bg-[#FF6600] text-[#080808] font-bold text-[11px] uppercase tracking-wide px-3 py-[6px] rounded-lg transition-transform hover:scale-105"
            >
              {codeCopied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="text-[11px] text-white/35 mt-2">Share this and get referral credit.</p>
        </div>

        <div className="flex gap-3 justify-center mt-5 flex-wrap">
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button
              onClick={shareImageCard}
              disabled={sharingImage}
              className="flex items-center gap-2 bg-white text-black font-bold text-xs uppercase tracking-wide px-5 py-3 rounded-full hover:scale-105 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sharingImage ? "Opening..." : "Share Card"}
            </button>
          )}
          <button
            onClick={downloadCard}
            disabled={downloading}
            className="flex items-center gap-2 bg-[#FF6600] text-black font-bold text-xs uppercase tracking-wide px-5 py-3 rounded-full hover:scale-105 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {downloading ? "Preparing..." : "Download Card"}
          </button>
          <button
            onClick={shareWA}
            disabled={sharingWA}
            className="flex items-center gap-2 bg-[#25D366] text-black font-bold text-xs uppercase tracking-wide px-5 py-3 rounded-full hover:scale-105 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {sharingWA ? "Opening..." : "WhatsApp"}
          </button>
          <button
            onClick={copyLink}
            className="flex items-center gap-2 bg-[#222] border border-white/10 text-white font-bold text-xs uppercase tracking-wide px-5 py-3 rounded-full hover:scale-105 transition-transform"
          >
            {linkCopied ? "Copied!" : "Copy Link"}
          </button>
        </div>
        {waError && <p className="text-[11px] text-red-300/70 mt-3">{waError}</p>}
      </div>
    </div>
  );
}
