import React, { useState } from "react";
import { BadgeData } from "../types";
import { BadgeCardFront } from "./BadgeCardFront";
import { BadgeCardBack } from "./BadgeCardBack";
import { Printer, X, ShieldCheck, Layers, Scissors, Maximize2 } from "lucide-react";

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
  const [printSize, setPrintSize] = useState<"FULL_PAGE" | "STANDARD" | "CR80">(
    "FULL_PAGE"
  );
  const [showCutGuides, setShowCutGuides] = useState<boolean>(true);

  const handlePrintTrigger = () => {
    window.print();
  };

  // Compute optimal card scale so both Front and Back fit completely on the print page
  const getCardScale = () => {
    if (printSize === "CR80") return 0.84; // Exact 85.6mm x 54mm physical ID size
    if (printSize === "STANDARD") return 1.0; // 385px x 245px
    // FULL_PAGE: fills landscape print page cleanly without clipping
    if (printLayout === "FRONT_ONLY" || printLayout === "BACK_ONLY") return 1.45;
    if (printLayout === "STACKED") return 1.15;
    return 1.12; // SIDE_BY_SIDE: ~886px total width, fits A4 & Letter landscape cleanly
  };

  const activeScale = getCardScale();

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto print:static print:inset-auto print:z-auto print:bg-white print:p-0 print:block print:overflow-visible">
      <div className="bg-slate-900 text-white rounded-3xl max-w-[96vw] w-full p-4 sm:p-6 border-2 border-[#d4af37] shadow-2xl relative space-y-5 my-auto print:max-w-none print:w-full print:p-0 print:m-0 print:bg-white print:text-black print:border-none print:shadow-none print:rounded-none print:space-y-0">
        {/* Header - Hidden in Print */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-gray-800 gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[#d4af37]">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-white">
                  የፓትሮል ባጅ ሙሉ ገፅ ማተሚያ (Full-Page Print Studio)
                </h3>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded-full">
                  {printSize === "CR80"
                    ? "CR80 (85.6×54mm)"
                    : printSize === "FULL_PAGE"
                    ? "ሙሉ ገፅ (Full Page)"
                    : "መደበኛ (100%)"}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                ፕሪንት ሲደረግ የፊትና የኋላ ገፅ ሙሉ በሙሉ በገፁ ላይ እንዲታይ ተስተካክሏል
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrintTrigger}
              className="px-6 py-2.5 bg-[#d4af37] text-[#0a192f] font-black text-xs rounded-xl shadow-lg hover:bg-[#b8860b] flex items-center gap-2 cursor-pointer active:scale-95 transition"
            >
              <Printer className="w-4 h-4" />
              አሁን አትም (Print Now)
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white bg-white/10 rounded-full cursor-pointer"
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
            <span className="text-slate-400 font-bold flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              አቀማመጥ፡
            </span>
            <div className="inline-flex flex-wrap bg-slate-900 p-1 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setPrintLayout("SIDE_BY_SIDE")}
                className={`px-3 py-1 font-bold rounded-md transition cursor-pointer ${
                  printLayout === "SIDE_BY_SIDE"
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                ጎን ለጎን (Side by Side)
              </button>
              <button
                type="button"
                onClick={() => setPrintLayout("STACKED")}
                className={`px-3 py-1 font-bold rounded-md transition cursor-pointer ${
                  printLayout === "STACKED"
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                ላይና ታች (Stacked)
              </button>
              <button
                type="button"
                onClick={() => setPrintLayout("FRONT_ONLY")}
                className={`px-3 py-1 font-bold rounded-md transition cursor-pointer ${
                  printLayout === "FRONT_ONLY"
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                የፊት ብቻ
              </button>
              <button
                type="button"
                onClick={() => setPrintLayout("BACK_ONLY")}
                className={`px-3 py-1 font-bold rounded-md transition cursor-pointer ${
                  printLayout === "BACK_ONLY"
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                የኋላ ብቻ
              </button>
            </div>
          </div>

          {/* Print Size Selection */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-bold flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
              የህትመት መጠን፡
            </span>
            <div className="inline-flex bg-slate-900 p-1 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setPrintSize("FULL_PAGE")}
                className={`px-3 py-1 font-bold rounded-md transition cursor-pointer ${
                  printSize === "FULL_PAGE"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                ሙሉ ገፅ (Full Page)
              </button>
              <button
                type="button"
                onClick={() => setPrintSize("STANDARD")}
                className={`px-3 py-1 font-bold rounded-md transition cursor-pointer ${
                  printSize === "STANDARD"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                100% መጠን
              </button>
              <button
                type="button"
                onClick={() => setPrintSize("CR80")}
                className={`px-3 py-1 font-bold rounded-md transition cursor-pointer ${
                  printSize === "CR80"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                CR80 (85.6×54mm)
              </button>
            </div>
          </div>

          {/* Cut Guides Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 font-bold">
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

        {/* Printable Area - Full Page Centered on Print */}
        <div className="bg-slate-950 p-4 sm:p-6 rounded-2xl border border-gray-800 overflow-x-auto print:overflow-visible print:bg-white print:p-0 print:border-none print:w-full print:min-h-[185mm] flex flex-col items-center justify-center gap-6">
          <div className="text-center print:mb-4 space-y-1">
            <span className="text-xs font-bold text-[#d4af37] bg-[#0a192f] px-3 py-1 rounded-full border border-[#d4af37]/40 inline-flex items-center gap-1.5 print:bg-slate-100 print:text-slate-900 print:border-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 print:text-blue-700" />
              አሶሳ ከተማ አስ/ር ወረዳ ሁለት ፖሊስ ጽ/ቤት - የቀበሌ ፓትሮል ባጅ
            </span>
            <h4 className="text-sm font-black text-white mt-1 print:text-slate-900">
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
                <span className="text-xs font-bold text-gray-400 print:text-slate-600 print:text-[10px]">
                  የፊት ገፅ (Front Side)
                </span>
                <div
                  className={`p-1 bg-white/5 rounded-2xl print:bg-transparent print:p-1 print:m-0 ${
                    showCutGuides
                      ? "border border-dashed border-amber-400/40 print:border-slate-400"
                      : "print:border-none"
                  }`}
                >
                  <BadgeCardFront data={badge} scale={activeScale} />
                </div>
              </div>
            )}

            {/* Back Card */}
            {(printLayout === "SIDE_BY_SIDE" ||
              printLayout === "STACKED" ||
              printLayout === "BACK_ONLY") && (
              <div className="flex flex-col items-center gap-2 print-card-container">
                <span className="text-xs font-bold text-gray-400 print:text-slate-600 print:text-[10px]">
                  የኋላ ገፅ (Back Side - QR Verification)
                </span>
                <div
                  className={`p-1 bg-white/5 rounded-2xl print:bg-transparent print:p-1 print:m-0 ${
                    showCutGuides
                      ? "border border-dashed border-amber-400/40 print:border-slate-400"
                      : "print:border-none"
                  }`}
                >
                  <BadgeCardBack data={badge} scale={activeScale} />
                </div>
              </div>
            )}
          </div>

          <div className="text-center text-xs text-gray-400 print:hidden max-w-xl leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            💡 <strong className="text-amber-300">የማተሚያ መመሪያ (Print Settings)፡</strong>{" "}
            በማተሚያ ሳጥኑ ውስጥ <strong>Layout &rarr; Landscape</strong>፣{" "}
            <strong>Scale &rarr; Fit to page / Default</strong>፣ እንዲሁም{" "}
            <strong>More settings &rarr; Background graphics</strong> የሚለውን ያብሩ::
          </div>
        </div>
      </div>
    </div>
  );
};
