import React, { useState } from "react";
import { BadgeData } from "../types";
import { BadgeCardFront } from "./BadgeCardFront";
import { BadgeCardBack } from "./BadgeCardBack";
import {
  Printer,
  X,
  ShieldCheck,
  Layers,
  Scissors,
  CreditCard,
} from "lucide-react";

interface PrintSheetModalProps {
  badge: BadgeData;
  onClose: () => void;
}

export const PrintSheetModal: React.FC<PrintSheetModalProps> = ({
  badge,
  onClose,
}) => {
  const [printLayout, setPrintLayout] = useState<
    "SIDE_BY_SIDE" | "STACKED" | "FRONT_ONLY" | "BACK_ONLY"
  >("SIDE_BY_SIDE");
  const [printSize, setPrintSize] = useState<"CR80" | "STANDARD" | "FULL_PAGE">(
    "CR80"
  );
  const [showCutGuides, setShowCutGuides] = useState<boolean>(true);

  const handlePrintTrigger = () => {
    window.print();
  };

  // Compute scale for non-ATM preview modes; ATM ("CR80") uses exact CSS mm dimensions
  const getCardScale = () => {
    if (printSize === "STANDARD") return 1.0; // 385px x 245px
    if (printSize === "FULL_PAGE") {
      if (printLayout === "FRONT_ONLY" || printLayout === "BACK_ONLY") return 1.45;
      if (printLayout === "STACKED") return 1.15;
      return 1.12;
    }
    return 1.0;
  };

  const activeScale = getCardScale();
  const isAtmSize = printSize === "CR80";

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto print:static print:inset-auto print:z-auto print:bg-white print:p-0 print:block print:overflow-visible">
      <div className="bg-slate-900 text-white rounded-3xl max-w-[96vw] w-full p-4 sm:p-6 border-2 border-[#d4af37] shadow-2xl relative space-y-5 my-auto print:max-w-none print:w-full print:p-0 print:m-0 print:bg-white print:text-black print:border-none print:shadow-none print:rounded-none print:space-y-0">
        {/* Header - Hidden in Print */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-gray-800 gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/15 border border-amber-400/40 rounded-xl text-[#facc15]">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-amber-300">
                  የፓትሮል ባጅ ኤቲኤም ሳይዝ ማተሚያ (ATM Size Print Studio)
                </h3>
                <span className="text-[10px] font-black text-emerald-300 bg-emerald-950/80 border border-emerald-400/40 px-2.5 py-0.5 rounded-full">
                  {isAtmSize
                    ? "ATM / CR-80 (85.6 × 53.98 mm)"
                    : printSize === "FULL_PAGE"
                    ? "ሙሉ ገፅ (Full Page)"
                    : "መደበኛ (100%)"}
                </span>
              </div>
              <p className="text-xs font-bold text-sky-300 mt-0.5">
                ባጁ በትክክለኛ የኤቲኤም ካርድ መጠን (85.6mm × 53.98mm) እንዲታተም ተስተካክሏል
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrintTrigger}
              className="px-6 py-2.5 bg-[#facc15] text-[#0a192f] font-black text-xs rounded-xl shadow-lg hover:bg-[#eab308] flex items-center gap-2 cursor-pointer active:scale-95 transition"
            >
              <Printer className="w-4 h-4" />
              በኤቲኤም ሳይዝ አትም (Print ATM Size)
            </button>
            <button
              onClick={onClose}
              className="p-2 text-sky-300 hover:text-white bg-white/10 rounded-full cursor-pointer"
              title="ዝጋ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Print Configuration Controls - Hidden in Print */}
        <div className="bg-slate-950 p-4 rounded-xl border border-gray-800 flex flex-wrap items-center justify-between gap-4 print:hidden text-xs">
          {/* Print Layout Selection */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sky-300 font-black flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              አቀማመጥ፡
            </span>
            <div className="inline-flex flex-wrap bg-slate-900 p-1 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setPrintLayout("SIDE_BY_SIDE")}
                className={`px-3 py-1 font-black rounded-md transition cursor-pointer ${
                  printLayout === "SIDE_BY_SIDE"
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "text-sky-200 hover:text-white"
                }`}
              >
                ጎን ለጎን (Side by Side)
              </button>
              <button
                type="button"
                onClick={() => setPrintLayout("STACKED")}
                className={`px-3 py-1 font-black rounded-md transition cursor-pointer ${
                  printLayout === "STACKED"
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "text-sky-200 hover:text-white"
                }`}
              >
                ላይና ታች (Stacked)
              </button>
              <button
                type="button"
                onClick={() => setPrintLayout("FRONT_ONLY")}
                className={`px-3 py-1 font-black rounded-md transition cursor-pointer ${
                  printLayout === "FRONT_ONLY"
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "text-sky-200 hover:text-white"
                }`}
              >
                የፊት ብቻ
              </button>
              <button
                type="button"
                onClick={() => setPrintLayout("BACK_ONLY")}
                className={`px-3 py-1 font-black rounded-md transition cursor-pointer ${
                  printLayout === "BACK_ONLY"
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "text-sky-200 hover:text-white"
                }`}
              >
                የኋላ ብቻ
              </button>
            </div>
          </div>

          {/* Print Size Selection */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sky-300 font-black flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              የህትመት መጠን፡
            </span>
            <div className="inline-flex bg-slate-900 p-1 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setPrintSize("CR80")}
                className={`px-3 py-1 font-black rounded-md transition cursor-pointer ${
                  printSize === "CR80"
                    ? "bg-emerald-500 text-slate-950 shadow"
                    : "text-sky-200 hover:text-white"
                }`}
              >
                ኤቲኤም ሳይዝ (85.6×54mm)
              </button>
              <button
                type="button"
                onClick={() => setPrintSize("STANDARD")}
                className={`px-3 py-1 font-black rounded-md transition cursor-pointer ${
                  printSize === "STANDARD"
                    ? "bg-blue-600 text-white shadow"
                    : "text-sky-200 hover:text-white"
                }`}
              >
                100% መጠን
              </button>
              <button
                type="button"
                onClick={() => setPrintSize("FULL_PAGE")}
                className={`px-3 py-1 font-black rounded-md transition cursor-pointer ${
                  printSize === "FULL_PAGE"
                    ? "bg-blue-600 text-white shadow"
                    : "text-sky-200 hover:text-white"
                }`}
              >
                ሙሉ ገፅ
              </button>
            </div>
          </div>

          {/* Cut Guides Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-amber-300 font-black">
            <input
              type="checkbox"
              checked={showCutGuides}
              onChange={(e) => setShowCutGuides(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 accent-amber-500"
            />
            <Scissors className="w-3.5 h-3.5 text-amber-400" />
            የመቁረጫ መስመር (Cut Guides)
          </label>
        </div>

        {/* Printable Area */}
        <div className="bg-slate-950 p-4 sm:p-6 rounded-2xl border border-gray-800 overflow-x-auto print:overflow-visible print:bg-white print:p-0 print:border-none print:w-full print:min-h-[180mm] flex flex-col items-center justify-center gap-6">
          <div className="text-center print:mb-3 space-y-1">
            <span className="text-xs font-black text-[#facc15] bg-[#0a192f] px-3 py-1 rounded-full border border-[#d4af37]/40 inline-flex items-center gap-1.5 print:bg-slate-100 print:text-slate-900 print:border-slate-300 print:text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 print:text-blue-700" />
              አሶሳ ከተማ አስ/ር ወረዳ ሁለት ፖሊስ ጽ/ቤት — {isAtmSize ? "የኤቲኤም ካርድ መጠን (85.6mm × 53.98mm)" : "የቀበሌ ፓትሮል ባጅ"}
            </span>
            <h4 className="text-sm font-black text-white mt-1 print:text-slate-900 print:text-xs">
              {badge.fullNameAmharic} ({badge.badgeId}) — {badge.departmentAmharic}
            </h4>
          </div>

          {/* Cards Container */}
          <div
            className={`flex items-center justify-center gap-6 print:gap-6 print:justify-center print:w-full print:m-0 ${
              printLayout === "SIDE_BY_SIDE"
                ? "flex-col xl:flex-row print:flex-row"
                : printLayout === "STACKED"
                ? "flex-col print:flex-col"
                : "flex-col"
            }`}
          >
            {/* Front Card */}
            {(printLayout === "SIDE_BY_SIDE" ||
              printLayout === "STACKED" ||
              printLayout === "FRONT_ONLY") && (
              <div className="flex flex-col items-center gap-2 print-card-container">
                <span className="text-xs font-black text-sky-300 print:text-slate-700 print:text-[9px]">
                  የፊት ገፅ (Front{isAtmSize ? " — 85.6×53.98mm" : ""})
                </span>
                {isAtmSize ? (
                  <div
                    className={`rounded-2xl p-[1.5px] print:bg-transparent ${
                      showCutGuides
                        ? "border border-dashed border-amber-400/70 print:border-slate-500"
                        : "border border-transparent"
                    }`}
                  >
                    <div className="atm-card-frame rounded-2xl">
                      <div className="atm-card-scaler">
                        <BadgeCardFront data={badge} scale={1} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`p-1 bg-white/5 rounded-2xl print:bg-transparent print:p-1 print:m-0 ${
                      showCutGuides
                        ? "border border-dashed border-amber-400/40 print:border-slate-400"
                        : "print:border-none"
                    }`}
                  >
                    <BadgeCardFront data={badge} scale={activeScale} />
                  </div>
                )}
              </div>
            )}

            {/* Back Card */}
            {(printLayout === "SIDE_BY_SIDE" ||
              printLayout === "STACKED" ||
              printLayout === "BACK_ONLY") && (
              <div className="flex flex-col items-center gap-2 print-card-container">
                <span className="text-xs font-black text-sky-300 print:text-slate-700 print:text-[9px]">
                  የኋላ ገፅ (Back{isAtmSize ? " — 85.6×53.98mm" : ""})
                </span>
                {isAtmSize ? (
                  <div
                    className={`rounded-2xl p-[1.5px] print:bg-transparent ${
                      showCutGuides
                        ? "border border-dashed border-amber-400/70 print:border-slate-500"
                        : "border border-transparent"
                    }`}
                  >
                    <div className="atm-card-frame rounded-2xl">
                      <div className="atm-card-scaler">
                        <BadgeCardBack data={badge} scale={1} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`p-1 bg-white/5 rounded-2xl print:bg-transparent print:p-1 print:m-0 ${
                      showCutGuides
                        ? "border border-dashed border-amber-400/40 print:border-slate-400"
                        : "print:border-none"
                    }`}
                  >
                    <BadgeCardBack data={badge} scale={activeScale} />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-center text-xs font-bold text-sky-200 print:hidden max-w-xl leading-relaxed bg-slate-900/90 p-3.5 rounded-xl border border-slate-700">
            💡 <strong className="text-amber-300 font-black">ለትክክለኛ የኤቲኤም ሳይዝ ህትመት መመሪያ፡</strong>{" "}
            በማተሚያ ሳጥኑ ውስጥ{" "}
            <strong className="text-emerald-300">Scale &rarr; 100% / Default (Actual Size)</strong>{" "}
            እንዲሁም <strong className="text-amber-300">Background graphics</strong> መብራቱን ያረጋግጡ:: ይህ ባጁን በትክክል{" "}
            <strong className="text-white font-mono">85.6mm × 53.98mm</strong> (መደበኛ የኤቲኤም ካርድ መጠን) ያትማል::
          </div>
        </div>
      </div>
    </div>
  );
};
