import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { BadgeData } from "../types";
import {
  DEFAULT_COMMISSION_LOGO,
  DEFAULT_OFFICIAL_SIGNATURE,
} from "../data/defaults";

interface BadgeCardBackProps {
  data: BadgeData;
  scale?: number;
  className?: string;
  onClick?: () => void;
  verificationUrlOverride?: string;
}

export const BadgeCardBack: React.FC<BadgeCardBackProps> = ({
  data,
  scale = 1,
  className = "",
  onClick,
  verificationUrlOverride,
}) => {
  const logo = data.commissionLogo || DEFAULT_COMMISSION_LOGO;
  const signature = data.signature || DEFAULT_OFFICIAL_SIGNATURE;

  // Build full verification URL or JSON string for QR Code
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const qrVerificationPayload =
    verificationUrlOverride ||
    `${origin}/?verify=${encodeURIComponent(data.badgeId)}`;

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
        className={`relative w-[385px] h-[245px] rounded-2xl overflow-hidden shadow-2xl border-4 border-[#d4af37] bg-gradient-to-br from-[#071326] via-[#0e2447] to-[#050d1b] text-white flex flex-col justify-between p-2.5 select-none print:shadow-none ${className}`}
      >
        {/* Subtle Executive Security Grid & Metallic Ambient Glow */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:12px_12px]" />
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-[#d4af37]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-[#38bdf8]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Large Watermark of Police Office Logo in Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <img
            src={logo}
            alt="Watermark Logo"
            className="w-[175px] h-[175px] object-contain opacity-[0.18] filter brightness-125 contrast-125"
          />
        </div>

        {/* Top Header Label */}
        <div className="relative text-center pb-1.5 border-b-2 border-[#d4af37] flex items-center justify-between gap-2">
          <h2 className="text-[9px] font-black text-[#fef08a] tracking-wide uppercase font-sans drop-shadow-md truncate">
            አሶሳ ከተማ አስ/ር ወረዳ 2 ፖሊስ ጽ/ቤት
          </h2>
          <div className="inline-block bg-gradient-to-r from-[#d4af37] via-[#fde047] to-[#d4af37] text-[#071326] text-[6.5px] font-black px-2 py-0.5 rounded shadow uppercase shrink-0">
            የፓትሮል ቅኝት ባጅ ማረጋገጫ (PATROL VERIFICATION)
          </div>
        </div>

        {/* Main Body: QR Code (Left) & Legal Terms + Signature (Right) */}
        <div className="relative my-1 flex-1 flex gap-2.5 items-center justify-between min-h-0">
          {/* Left: High-res QR Code & Scanner Instructions */}
          <div className="flex flex-col items-center justify-center bg-[#071326]/90 backdrop-blur-md rounded-xl p-1.5 border border-[#d4af37]/70 shadow-lg shrink-0">
            <div className="p-1 bg-white rounded-lg shadow-xl border border-[#d4af37]">
              <QRCodeSVG
                value={qrVerificationPayload}
                size={92}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: logo,
                  x: undefined,
                  y: undefined,
                  height: 18,
                  width: 18,
                  excavate: true,
                }}
              />
            </div>

            <div className="mt-1 inline-flex items-center gap-0.5 bg-gradient-to-r from-[#d4af37] to-[#fde047] text-[#071326] text-[6px] font-black px-1.5 py-0.5 rounded shadow uppercase">
              <svg
                className="w-2.5 h-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              ስካን አድርገው ያረጋግጡ
            </div>
          </div>

          {/* Right: Property Notice & Official Authentication */}
          <div className="flex-1 flex flex-col justify-between h-full space-y-1.5 text-left min-w-0">
            {/* Terms & Legal Notice */}
            <div className="text-[6.2px] text-slate-100 bg-[#071326]/95 p-2 rounded-lg border border-[#d4af37]/45 leading-snug space-y-1 shadow-inner">
              <p className="font-black font-sans text-[#fef08a]">
                • ይህ ባጅ በአሶሳ ከተማ አስ/ር ወረዳ ሁለት ፖሊስ ጽ/ቤት ለቀበሌ ፓትሮል ቅኝት አባላት የተሰጠ ነው::
              </p>
              <p className="text-slate-100 font-bold">
                • ባጁ ቢጠፋ ወይም ሌላ ሰው ቢያገኘው በአቅራቢያው ለሚገኝ ፖሊስ ጣቢያ ወይም ለወረዳ 2 ፖሊስ ጽ/ቤት ያስረክቡ ወይም በ
                <strong className="text-[#fde047] font-mono ml-0.5 font-black">9991</strong> ይደውሉ::
              </p>
              <p className="text-[5.2px] text-sky-300 font-black uppercase font-mono tracking-tight pt-0.5 border-t border-[#d4af37]/25">
                PROPERTY OF ASSOSA CITY ADMIN. WOREDA 2 POLICE OFFICE.
              </p>
            </div>

            {/* Authorized Signature & DB Auth Serial */}
            <div className="pt-1 border-t border-[#d4af37]/80 flex items-end justify-between gap-2">
              <div className="flex flex-col text-left">
                <span className="text-[5.5px] font-black text-sky-300 uppercase leading-none">
                  የፍቃድ ቁጥር / AUTH ID:
                </span>
                <span className="text-[7.5px] font-black text-white font-mono mt-0.5">
                  {data.badgeId ? `AUTH-${data.badgeId}` : "AUTH-0000"}
                </span>
                <span className="text-[5.2px] text-emerald-300 font-black flex items-center gap-0.5 mt-0.5">
                  ● SECURED FIRESTORE DB
                </span>
              </div>

              <div className="flex flex-col items-center">
                {/* Crisp White-Backed Official Signature Strip */}
                <div className="w-26 h-7 border border-[#d4af37] flex items-center justify-center px-1 py-0.5 bg-white/95 rounded shadow-sm">
                  <img
                    src={signature}
                    alt="Official Signature"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <span className="text-[5.2px] font-black text-[#fef08a] uppercase mt-0.5">
                  የጽ/ቤት ኃላፊ ፊርማ / WOREDA 2 POLICE HEAD
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
