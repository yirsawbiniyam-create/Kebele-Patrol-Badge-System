import React from "react";
import { BadgeData } from "../types";
import {
  DEFAULT_ETHIOPIA_FLAG,
  DEFAULT_REGION_FLAG,
  DEFAULT_COMMISSION_LOGO,
  DEFAULT_CHEST_BADGE,
} from "../data/defaults";

interface BadgeCardFrontProps {
  data: BadgeData;
  scale?: number;
  className?: string;
  onClick?: () => void;
}

export const BadgeCardFront: React.FC<BadgeCardFrontProps> = ({
  data,
  scale = 1,
  className = "",
  onClick,
}) => {
  const ethiopianFlag = data.ethiopiaFlag || DEFAULT_ETHIOPIA_FLAG;
  const regionalFlag = data.regionFlag || DEFAULT_REGION_FLAG;
  const logo = data.commissionLogo || DEFAULT_COMMISSION_LOGO;

  const scaledWidth = Math.round(385 * scale);
  const scaledHeight = Math.round(245 * scale);

  return (
    <div
      style={{
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`,
      }}
      className="shrink-0 relative overflow-visible flex items-start justify-start select-none"
    >
      <div
        onClick={onClick}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
        className={`relative w-[385px] h-[245px] rounded-2xl overflow-hidden shadow-2xl border-4 border-[#eab308] bg-gradient-to-b from-[#0b234a] via-[#13366d] to-[#081734] text-white flex flex-col justify-between select-none print:shadow-none ${className}`}
      >
        {/* Background Security Pattern & Subtle Accent Glows */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#facc15_1px,transparent_1px)] [background-size:10px_10px]" />
        <div className="absolute -top-14 -left-14 w-36 h-36 bg-[#facc15]/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-14 -right-14 w-36 h-36 bg-[#2563eb]/30 rounded-full blur-2xl pointer-events-none" />

        {/* Official Police Logo Security Watermark in Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <img
            src={logo}
            alt="Watermark Logo"
            className="w-[170px] h-[170px] object-contain opacity-[0.16] filter brightness-125 contrast-125"
          />
        </div>

        {/* Top Header Section: Flags & Office Logo with Titles */}
        <div className="relative pt-1 px-2.5 pb-1 bg-gradient-to-r from-[#091833] via-[#133261] to-[#091833] border-b-2 border-[#eab308]">
          <div className="flex items-center justify-between gap-2">
            {/* Left: Ethiopian National Flag */}
            <div className="w-8 h-5 rounded border border-[#facc15] overflow-hidden shadow-md bg-black shrink-0">
              <img
                src={ethiopianFlag}
                alt="Ethiopia Flag"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Center: Office Logo + Titles */}
            <div className="flex items-center gap-2 flex-1 justify-center min-w-0">
              <div className="w-8 h-8 p-0.5 rounded-full bg-gradient-to-tr from-[#facc15] via-white to-[#eab308] shadow-lg ring-1 ring-[#facc15]/60 shrink-0">
                <img
                  src={logo}
                  alt="Police Logo"
                  className="w-full h-full object-contain rounded-full bg-white filter contrast-[1.08] brightness-[1.05]"
                />
              </div>

              <div className="text-center min-w-0">
                <h1 className="text-[9.5px] font-black leading-tight text-white tracking-tight drop-shadow-md font-sans truncate">
                  አሶሳ ከተማ አስ/ር ወረዳ 2 ፖሊስ ጽ/ቤት
                </h1>
                <p className="text-[5.5px] font-black text-[#fef08a] tracking-tight uppercase leading-none mt-0.5 truncate">
                  ASSOSA WOREDA 2 POLICE OFFICE • KEBELE PATROL
                </p>
              </div>

              <div className="inline-block bg-[#facc15] text-[#0b1c3a] text-[7px] font-black px-1.5 py-0.5 rounded shadow uppercase tracking-wider shrink-0">
                የፓትሮል ባጅ
              </div>
            </div>

            {/* Right: Benishangul Gumuz Regional Flag */}
            <div className="w-8 h-5 rounded border border-[#facc15] overflow-hidden shadow-md bg-black shrink-0">
              <img
                src={regionalFlag}
                alt="Benishangul Flag"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Main Body: Seamlessly Blended Photo (Left) & Patrol Member Data (Right) */}
        <div className="relative px-2.5 py-1.5 flex-1 flex gap-2 items-center justify-between min-h-0">
          {/* Left Column: Borderless Blended Portrait with Soft Localized White Halo */}
          <div className="relative w-[104px] h-[138px] shrink-0 flex items-center justify-center overflow-visible">
            {/* Localized soft white backdrop ONLY behind the portrait area */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.92)_0%,rgba(241,245,249,0.68)_42%,rgba(255,255,255,0.18)_66%,rgba(255,255,255,0)_82%)]" />

            {data.headshotPhoto ? (
              <img
                src={data.headshotPhoto}
                alt="Personnel Headshot"
                className="relative z-10 w-full h-full object-cover object-top filter brightness-[1.06] contrast-[1.08] saturate-[1.1] [mask-image:radial-gradient(ellipse_72%_76%_at_50%_46%,black_52%,rgba(0,0,0,0.65)_72%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_72%_76%_at_50%_46%,black_52%,rgba(0,0,0,0.65)_72%,transparent_100%)]"
              />
            ) : (
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-slate-700 [mask-image:radial-gradient(ellipse_74%_78%_at_50%_48%,black_56%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_74%_78%_at_50%_48%,black_56%,transparent_100%)]">
                <svg
                  className="w-9 h-9 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="text-[7px] font-black mt-0.5 text-slate-700">
                  ጉርድ ፎቶ
                </span>
              </div>
            )}
          </div>

          {/* Right Column: Personnel Information & Chest Shield */}
          <div className="flex-1 flex flex-col justify-between h-full space-y-1 text-left min-w-0 pr-0.5">
            {/* Badge ID, Status & Shield Crest Row */}
            <div className="flex items-center justify-between gap-1">
              <div className="inline-flex items-center gap-1 bg-[#07152e]/95 border border-[#facc15]/70 rounded px-1.5 py-0.5 shadow-sm">
                <span className="text-[6.5px] text-sky-300 font-black uppercase">ባጅ ቁጥር:</span>
                <span className="text-[8.5px] font-black text-[#fef08a] tracking-wider font-mono">
                  {data.badgeId || "AW2P-0000"}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <span
                  className={`px-1.5 py-0.5 rounded text-[6.5px] font-black uppercase tracking-wider shadow ${
                    data.status === "ACTIVE"
                      ? "bg-[#facc15] text-[#0b1c3a]"
                      : "bg-rose-500 text-white"
                  }`}
                >
                  {data.status === "ACTIVE" ? "ኦፊሴላዊ" : data.status}
                </span>
                <div className="w-6 h-5 object-contain">
                  <img
                    src={DEFAULT_CHEST_BADGE}
                    alt="Badge Shield"
                    className="w-full h-full object-contain drop-shadow"
                  />
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <span className="text-[6px] font-black text-[#facc15] uppercase block leading-none">
                ሙሉ ስም / Full Name:
              </span>
              <h3 className="text-[11px] font-black text-white leading-tight font-sans truncate mt-0.5">
                {data.fullNameAmharic || "ያልተሞላ ስም"}
              </h3>
              <p className="text-[8px] font-black text-sky-200 uppercase leading-none truncate mt-0.5">
                {data.fullNameEnglish || "Full Name Placeholder"}
              </p>
            </div>

            {/* Kebele / Patrol Unit & Role in 2-column horizontal grid */}
            <div className="grid grid-cols-2 gap-1.5">
              {/* Kebele / Department */}
              <div className="min-w-0">
                <span className="text-[5.5px] font-black text-[#facc15] uppercase block leading-none">
                  ቀበሌ / Kebele:
                </span>
                <p className="text-[8px] font-black text-white leading-tight font-sans truncate mt-0.5">
                  {data.departmentAmharic || "ቀበሌ 01 ፓትሮል ቅኝት"}
                </p>
                <p className="text-[6.5px] font-black text-amber-200 uppercase leading-none truncate">
                  {data.departmentEnglish || "Kebele 01 Patrol"}
                </p>
              </div>

              {/* Role / Rank */}
              <div className="min-w-0">
                <span className="text-[5.5px] font-black text-[#facc15] uppercase block leading-none">
                  ድርሻ / Role:
                </span>
                <p className="text-[8px] font-black text-[#fef08a] leading-tight font-sans truncate mt-0.5">
                  {data.rankAmharic || "የቀበሌ ፓትሮል ቅኝት አባል"}
                </p>
                <p className="text-[6.5px] font-black text-sky-200 uppercase leading-none truncate">
                  {data.rankEnglish || "Kebele Patrol Member"}
                </p>
              </div>
            </div>

            {/* Phone Number */}
            <div className="pt-0.5 border-t border-amber-400/35 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-[6px] font-black text-[#facc15] uppercase leading-none">
                  ስልክ ቁጥር / Phone:
                </span>
                <span className="text-[8px] font-black text-white font-mono leading-none">
                  {data.phoneNumber || "+251 900 000000"}
                </span>
              </div>
              <span className="text-[5.5px] font-black text-emerald-300 font-mono">
                ● SECURE ID
              </span>
            </div>
          </div>
        </div>

        {/* Footer Section: Validity & Security Holographic Band */}
        <div className="relative bg-gradient-to-r from-[#eab308] via-[#fef9c3] to-[#eab308] text-[#0f2d5e] px-2.5 py-0.5 flex items-center justify-between border-t-2 border-[#ca8a04]">
          <div>
            <span className="text-[5.5px] font-black uppercase block leading-none text-[#0f2d5e]">
              የተሰጠበት / ISSUED:
            </span>
            <span className="text-[7px] font-black font-mono leading-tight text-[#081734]">
              {data.issueDate || "2026-08-10"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[6px] font-black uppercase tracking-wider text-[#081734]">
              ★ ASSOSA WOREDA 2 PATROL BADGE ★
            </span>
            <span className="text-[5.5px] font-black uppercase text-[#1e3a8a]">
              አሶሳ ወረዳ 2 ፖሊስ ጽ/ቤት
            </span>
          </div>

          <div className="text-right">
            <span className="text-[5.5px] font-black uppercase block leading-none text-[#0f2d5e]">
              የሚያበቃበት / EXPIRES:
            </span>
            <span className="text-[7px] font-black font-mono leading-tight text-[#081734]">
              {data.expiryDate || "2029-08-10"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
