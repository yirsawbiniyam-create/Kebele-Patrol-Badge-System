import React, { useState } from "react";
import { BadgeData } from "../types";
import { BadgeCardFront } from "./BadgeCardFront";
import { BadgeCardBack } from "./BadgeCardBack";
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  QrCode,
  CheckCircle,
  Calendar,
  User,
  Phone,
  Building,
  Award,
  Lock,
  ExternalLink,
  Printer,
} from "lucide-react";

interface BadgeVerifierViewProps {
  badge: BadgeData | null;
  onSearchBadgeId: (id: string) => void;
  onOpenScanner: () => void;
  onPrint?: (badge: BadgeData) => void;
  loading?: boolean;
  searchedId?: string;
}

export const BadgeVerifierView: React.FC<BadgeVerifierViewProps> = ({
  badge,
  onSearchBadgeId,
  onOpenScanner,
  onPrint,
  loading = false,
  searchedId = "",
}) => {
  const [inputQuery, setInputQuery] = useState(searchedId);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      onSearchBadgeId(inputQuery.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search & Scanner Bar */}
      <div className="bg-[#1e293b] p-6 rounded-2xl shadow-xl border border-slate-700 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
              የወረዳ 2 ፖሊስ ጽ/ቤት የፓትሮል ባጅ ማረጋገጫ / Patrol Badge Verification
            </h2>
            <p className="text-xs font-bold text-sky-300 mt-1">
              የቀበሌ ፓትሮል አባሉን QR Code በካሜራ ስካን ያድርጉ ወይም የባጅ ቁጥሩን በማስገባት ትክክለኛነቱን ያረጋግጡ
            </p>
          </div>

          <button
            onClick={onOpenScanner}
            className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg border border-blue-400 transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <QrCode className="w-5 h-5 text-amber-300" />
            QR Code በካሜራ ስካን አድርግ
          </button>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400" />
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="የባጅ ቁጥር ያስገቡ (ምሳሌ፡ AW2P-1001)..."
              className="w-full pl-11 pr-4 py-3 text-sm font-mono font-black bg-slate-800 text-amber-200 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow transition cursor-pointer"
          >
            {loading ? "በመፈለግ ላይ..." : "ያረጋግጡ"}
          </button>
        </form>
      </div>

      {/* Verification Result Display */}
      {loading ? (
        <div className="bg-[#1e293b] p-12 rounded-2xl text-center shadow-xl border border-slate-700 space-y-3">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-300">
            የባጁ መረጃ ከፋየርስቶር ዳታቤዝ በመረጋገጥ ላይ ነው...
          </p>
        </div>
      ) : badge ? (
        <div className="bg-[#1e293b] rounded-2xl p-6 shadow-2xl border border-slate-700 space-y-6">
          {/* Official Verification Banner */}
          <div
            className={`p-4 rounded-xl flex items-center gap-3 shadow-md ${
              badge.status === "ACTIVE"
                ? "bg-emerald-950/80 text-emerald-100 border border-emerald-700/50"
                : "bg-rose-950/80 text-rose-100 border border-rose-700/50"
            }`}
          >
            {badge.status === "ACTIVE" ? (
              <CheckCircle className="w-10 h-10 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-10 h-10 text-rose-400 shrink-0" />
            )}

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-wide">
                  {badge.status === "ACTIVE"
                    ? "✅ ኦፊሴላዊ የተረጋገጠ የቀበሌ ፓትሮል ባጅ / OFFICIALLY VERIFIED PATROL BADGE"
                    : "⚠️ ያልተረጋገጠ ወይም የተሰረዘ ባጅ / REVOKED BADGE"}
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                ይህ ባጅ በአሶሳ ከተማ አስ/ር ወረዳ ሁለት ፖሊስ ጽ/ቤት የተመዘገበና ለቀበሌ ፓትሮል ቅኝት አገልግሎት የተሰጠ ነው::
              </p>
            </div>
            <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
              <div className="flex items-center gap-2">
                {onPrint && (
                  <button
                    onClick={() => onPrint(badge)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] rounded-lg shadow transition flex items-center gap-1 cursor-pointer"
                    title="ባጁን ሙሉ ገፅ አትም"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    አትም (Print)
                  </button>
                )}
                <button
                  onClick={() => window.open(`/?verify=${encodeURIComponent(badge.badgeId)}`, "_blank")}
                  className="px-3 py-1.5 bg-[#facc15] hover:bg-[#eab308] text-[#0b1c3a] font-black text-[11px] rounded-lg shadow transition flex items-center gap-1 cursor-pointer"
                  title="ይህንን ባጅ በስልክ ስካን ሲደረግ የሚታየውን ኦፊሴላዊ የQR ገፅ ይክፈቱ"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  የQR ገፅን ክፈት
                </button>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                FIRESTORE SYNC: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Details & Photos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Officer Photo & Seal */}
            <div className="flex flex-col items-center bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
              <div className="w-36 h-48 rounded-lg border-2 border-slate-600 bg-slate-900 overflow-hidden shadow-xl mb-3">
                <img
                  src={badge.headshotPhoto}
                  alt={badge.fullNameAmharic}
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <h4 className="text-base font-black text-white font-sans">
                {badge.fullNameAmharic}
              </h4>
              <p className="text-xs font-black text-amber-300">
                {badge.fullNameEnglish}
              </p>
              <span className="mt-2 px-3 py-1 bg-blue-600/20 text-sky-300 border border-blue-400/40 font-mono font-black text-xs rounded-full">
                {badge.badgeId}
              </span>
            </div>

            {/* Officer Data Sheet */}
            <div className="md:col-span-2 space-y-4 bg-slate-800 p-5 rounded-xl border border-slate-700 text-xs">
              <h4 className="text-sm font-black text-amber-300 pb-2 border-b border-slate-700 flex items-center gap-2">
                <User className="w-4 h-4 text-sky-400" />
                የባለባጁ ኦፊሴላዊ መረጃዎች
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-sky-300 font-black block">
                    የሚሰራበት ቀበሌ / Kebele Unit:
                  </span>
                  <p className="text-sm font-black text-white font-sans">
                    {badge.departmentAmharic}
                  </p>
                  <p className="text-xs font-bold text-amber-200">
                    {badge.departmentEnglish}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-sky-300 font-black block">
                    የስራ ድርሻ / Patrol Role:
                  </span>
                  <p className="text-sm font-black text-amber-300 font-sans">
                    {badge.rankAmharic}
                  </p>
                  <p className="text-xs font-bold text-sky-200">
                    {badge.rankEnglish}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-sky-300 font-black block">
                    ስልክ ቁጥር / Phone Number:
                  </span>
                  <p className="text-sm font-mono font-black text-emerald-300">
                    {badge.phoneNumber}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-sky-300 font-black block">
                    የባጁ ሁኔታ / Status:
                  </span>
                  <span className="inline-block px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-black rounded-lg uppercase">
                    {badge.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-sky-300 font-black block">
                    የተሰጠበት ቀን / Issued:
                  </span>
                  <p className="text-xs font-mono font-black text-white">
                    {badge.issueDate}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-sky-300 font-black block">
                    የሚያበቃበት ቀን / Expiry:
                  </span>
                  <p className="text-xs font-mono font-black text-amber-200">
                    {badge.expiryDate}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-700 flex items-center justify-between text-[11px]">
                <span className="text-amber-300 font-black">
                  ተቋም፡ አሶሳ ከተማ አስ/ር ወረዳ ሁለት ፖሊስ ጽ/ቤት
                </span>
                <span className="text-emerald-300 font-black flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  የተጠበቀ መረጃ
                </span>
              </div>
            </div>
          </div>

          {/* Side-by-Side Front and Back Badge Preview Cards */}
          <div className="pt-4 border-t border-slate-700">
            <h4 className="text-sm font-bold text-slate-100 mb-4 text-center">
              የባጁ የፊት እና የኋላ ገፅ እይታ / Front & Back Cards
            </h4>
            <div className="flex flex-wrap items-center justify-center gap-6 overflow-visible p-2">
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-blue-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 shadow">
                  የፊት ገፅ (Front)
                </span>
                <BadgeCardFront data={badge} scale={0.88} />
              </div>

              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-blue-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 shadow">
                  የኋላ ገፅ (Back with QR)
                </span>
                <BadgeCardBack data={badge} scale={0.88} />
              </div>
            </div>
          </div>
        </div>
      ) : searchedId ? (
        <div className="bg-[#1e293b] p-12 rounded-2xl text-center shadow-xl border border-rose-900/50 space-y-3">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-rose-400">
            የተፈለገው የባጅ ቁጥር ({searchedId}) አልተገኘም
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            እባክዎን የባጅ ቁጥሩን በትክክል ማስገባትዎን ያረጋግጡ ወይም የQR ኮዱን እንደገና ስካን ያድርጉ::
          </p>
        </div>
      ) : null}
    </div>
  );
};
