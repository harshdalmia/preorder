"use client";
// src/components/Preorder/PerksSection.tsx

export default function PerksSection() {
  const highlights = [
    "Founding member price locked permanently",
    "Priority dispatch, first collars leave our workshop first",
    "Direct access to the product team via a private channel",
    "Your dog's name on the Founding Wall",
  ];

  const perks = [
    {
      n: "PERK 01",
      title: "Geo-fence Intelligence",
      desc: "Define safe zones on a map. Get alerted the moment your dog crosses them before they're out of sight.",
    },
    {
      n: "PERK 02",
      title: "Activity Insights",
      desc: "Spot your dog moves, where they tend to wander, and whether anything's quietly changed - all without being there to see it.",
    },
    {
      n: "PERK 03",
      title: "Shape the Product",
      desc: "Founding members have a voice. Your feedback directly influences features in version 2 and beyond.",
    },
  ];

  const specs = [
    ["GPS Technology", "GPS"],
    ["Battery Life", "7 days passive · 3–4 days active"],
    ["Connectivity", "WiFi/BLE/LTE"],
  ];

  return (
    <>
      {/* ── 001 Product ─────────────────────────────────── */}
      <section
        id="collar"
        className="bg-[#0a0a0a] py-20 sm:py-28 px-6 sm:px-10 md:px-20"
      >
        <div className="max-w-[1100px] mx-auto">
          <p className="text-[12px] font-semibold tracking-[4px] uppercase text-white/20 mb-6 sm:mb-8">
            001 — Product
          </p>
          <h2
            className="font-playfair font-normal text-white leading-[1.08] mb-14 sm:mb-20"
            style={{ fontSize: "clamp(32px, 4.5vw, 64px)" }}
          >
            Engineered for
            <br />
            the ones you <span className="text-[#E8622A]">love.</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Map image */}
            <div className="aspect-[4/3] bg-[#0a0a0a] rounded-2xl overflow-hidden relative">
              <img
                src="/map.jpg"
                alt="GPS Map"
                className="w-full h-full object-cover"
                style={{ filter: "brightness(0.4)" }}
              />
              {/* edge vignette to blend into background */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at center, transparent 25%, #0a0a0a 60%)",
                }}
              />
            </div>

            {/* Right: text + specs */}
            <div>
              <h3
                className="font-playfair font-normal text-white leading-[1.15] mb-5"
                style={{ fontSize: "clamp(22px, 2.5vw, 34px)" }}
              >
                Built for India.
                <br />
                Designed for life.
              </h3>
              <p className="text-[14px] sm:text-[15px] text-white/40 font-light leading-[1.9] mb-4">
                A precision GPS collar that knows when your dog wanders too far,
                sends you an alert before you notice they're gone, and maps
                every walk with quiet intelligence.
              </p>

              {/* Specs */}
              <div className="flex flex-col">
                {specs.map(([label, value], i) => (
                  <div
                    key={label}
                    className={`flex justify-between items-center py-4 ${i < specs.length - 1 ? "border-b border-white/[0.05]" : ""}`}
                  >
                    <span className="text-[13px] text-white/25 font-light">
                      {label}
                    </span>
                    <span className="text-[12px] sm:text-[13px] text-white/65 font-light text-right ml-4">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 002 Founding Perks ──────────────────────────── */}
      <section
        id="perks"
        className="bg-[#0a0a0a] py-20 sm:py-28 px-6 sm:px-10 md:px-20 border-t border-white/[0.04]"
      >
        <div className="max-w-[1100px] mx-auto">
          <p className="text-[12px] font-semibold tracking-[4px] uppercase text-white/20 mb-6 sm:mb-8">
            002 — Founding Perks
          </p>
          <h2
            className="font-playfair font-normal text-white leading-[1.08] mb-12 sm:mb-16"
            style={{ fontSize: "clamp(32px, 4.5vw, 64px)" }}
          >
            Not a discount.
            <br />
            An <span className="text-[#E8622A]">invitation.</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Left — pricing card */}
            <div className="bg-[#111] rounded-2xl p-8 sm:p-10 flex flex-col">
              <div>
                <p className="text-[13px] text-white/20 line-through tracking-widest mb-3">
                  ₹6,999 RETAIL
                </p>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="font-playfair text-white/80 text-[26px] sm:text-[28px]">
                    ₹
                  </span>
                  <span
                    className="font-playfair font-normal text-white leading-none"
                    style={{ fontSize: "clamp(56px, 7vw, 96px)" }}
                  >
                    4,999
                  </span>
                </div>
                <p
                  className="text-[14px] text-[#E8622A] font-light font-playfair mb-3"
                  style={{ fontStyle: "italic" }}
                >
                  You save ₹2,000 — forever.
                </p>
                <p className="text-[13px] text-white/35 font-light leading-[1.85] mb-2">
                  Founding members lock in the lowest price MyPerro will ever be
                  offered. As the product evolves, your price stays unchanged.
                </p>
              </div>
              <ul className="flex flex-col gap-3 mt-4">
                {highlights.map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-3 text-[13px] text-white/50 font-light"
                  >
                    <span className="w-[6px] h-[6px] rounded-full bg-[#E8622A] shrink-0 mt-[6px]" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — perk cards */}
            <div className="flex flex-col gap-3 sm:gap-4">
              {perks.map((p) => (
                <div key={p.n} className="bg-[#111] rounded-2xl p-7 sm:p-8">
                  <p className="text-[10px] font-semibold tracking-[3px] uppercase text-[#E8622A] mb-4">
                    {p.n}
                  </p>
                  <h4
                    className="font-playfair font-normal text-white mb-3 leading-[1.2]"
                    style={{ fontSize: "clamp(17px, 1.8vw, 22px)" }}
                  >
                    {p.title}
                  </h4>
                  <p className="text-[13px] text-white/35 font-light leading-[1.8]">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 003 Stats ───────────────────────────────────── */}
      <section className="bg-[#0a0a0a] py-20 sm:py-28 px-6 sm:px-10 md:px-20 border-t border-white/[0.04]">
        <div className="max-w-[1100px] mx-auto">
          <p className="text-[12px] font-semibold tracking-[4px] uppercase text-white/20 mb-6 sm:mb-8">
            003 — Traction
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 mb-16 sm:mb-20">
            <h2
              className="font-playfair font-normal text-white leading-[1.1]"
              style={{ fontSize: "clamp(32px, 4.5vw, 60px)" }}
            >
              Numbers
              <br />
              don't <span className="text-[#E8622A]">lie.</span>
            </h2>
            <p className="text-[14px] sm:text-[15px] text-white/35 font-light leading-[1.9] md:self-end md:pb-1">
              Before the first collar shipped, India's dog-parent community
              found us. That validation is the reason the Founding Pack exists.
            </p>
          </div>

          {/* Stats — 2 col on mobile, 4 col on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              {
                num: "97",
                suffix: "%",
                label: "waitlist satisfaction in\nearly surveys",
              },
              { num: "86", suffix: "+", label: "pre-registered pet\nparents" },
              { num: "22", suffix: "+", label: "cities across\nIndia" },
              {
                num: "100",
                suffix: "+",
                label: "vet and trainer\nconversations",
              },
            ].map((s, i) => (
              <div
                key={s.label}
                className={`py-8 sm:py-10 px-4 sm:px-8 ${i % 2 !== 0 || i > 0 ? "border-l border-white/[0.05]" : ""} ${i >= 2 ? "border-t border-white/[0.05] md:border-t-0" : ""} ${i > 0 && i < 2 ? "" : ""}`}
              >
                <div className="mb-3 sm:mb-4">
                  <span
                    className="font-playfair font-normal text-white"
                    style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
                  >
                    {s.num}
                  </span>
                  <span
                    className="font-playfair text-[#E8622A]"
                    style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
                  >
                    {s.suffix}
                  </span>
                </div>
                <p className="text-[14px] sm:text-[15px] text-white/25 font-light leading-[1.7] whitespace-pre-line">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
