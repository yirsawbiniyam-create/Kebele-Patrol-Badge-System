// Public Verification Page for Police Badge QR Scanning
import React, { useState, useEffect } from "react";
import {
  collection,
  doc,
  getDocFromServer,
  getDocsFromServer,
  query,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { BadgeData } from "../types";
import { BadgeCardFront } from "./BadgeCardFront";
import { BadgeCardBack } from "./BadgeCardBack";
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertOctagon,
} from "lucide-react";

interface PublicVerificationPageProps {
  initialBadgeId: string;
  allBadges?: BadgeData[];
}

export const PublicVerificationPage: React.FC<PublicVerificationPageProps> = ({
  initialBadgeId,
  allBadges = [],
}) => {
  const [badgeId] = useState(initialBadgeId);
  const [badge, setBadge] = useState<BadgeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchBadgeData(badgeId);
  }, [badgeId, allBadges]);

  const fetchBadgeData = async (idToSearch: string) => {
    const cleanId = idToSearch.trim();
    if (!cleanId) {
      setBadge(null);
      setLoading(false);
      setNotFound(true);
      return;
    }

    setLoading(true);
    setNotFound(false);

    // Always verify live against Firestore server first so deleted badges immediately stop working
    try {
      const docRef = doc(db, "badges", cleanId);
      const docSnap = await getDocFromServer(docRef);

      if (docSnap.exists()) {
        setBadge({ id: docSnap.id, ...(docSnap.data() as BadgeData) });
        setNotFound(false);
        setLoading(false);
        return;
      }

      // Query by badgeId field in case Firestore document ID differs
      const badgeQuery = query(
        collection(db, "badges"),
        where("badgeId", "==", cleanId)
      );
      const querySnap = await getDocsFromServer(badgeQuery);
      if (!querySnap.empty) {
        const firstDoc = querySnap.docs[0];
        setBadge({ id: firstDoc.id, ...(firstDoc.data() as BadgeData) });
        setNotFound(false);
        setLoading(false);
        return;
      }

      // Case-insensitive check across registered badges on Firestore server
      const allSnap = await getDocsFromServer(collection(db, "badges"));
      let foundBadge: BadgeData | null = null;
      allSnap.forEach((d) => {
        const data = d.data() as BadgeData;
        if (
          d.id.toLowerCase().trim() === cleanId.toLowerCase() ||
          data.badgeId?.toLowerCase().trim() === cleanId.toLowerCase()
        ) {
          foundBadge = { id: d.id, ...data };
        }
      });

      if (foundBadge) {
        setBadge(foundBadge);
        setNotFound(false);
      } else {
        // Authoritative server says badge does NOT exist (deleted or unregistered)
        setBadge(null);
        setNotFound(true);
      }
      setLoading(false);
      return;
    } catch (err) {
      console.warn("Firestore server check offline fallback on public verification:", err);
      // Offline-only fallback: check live in-memory badges or local cache
      const liveMatch = allBadges.find(
        (b) =>
          b.badgeId?.toLowerCase().trim() === cleanId.toLowerCase() ||
          b.id?.toLowerCase().trim() === cleanId.toLowerCase()
      );
      if (liveMatch) {
        setBadge(liveMatch);
        setNotFound(false);
        setLoading(false);
        return;
      }

      const localSaved = localStorage.getItem("assosa_w2_police_badges");
      if (localSaved) {
        try {
          const list: BadgeData[] = JSON.parse(localSaved);
          const localMatch = list.find(
            (b) =>
              b.badgeId?.toLowerCase().trim() === cleanId.toLowerCase() ||
              b.id?.toLowerCase().trim() === cleanId.toLowerCase()
          );
          if (localMatch) {
            setBadge(localMatch);
            setNotFound(false);
            setLoading(false);
            return;
          }
        } catch {
          // ignore
        }
      }
      setBadge(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060d1c] text-slate-100 font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between p-3 sm:p-6">
      <main className="max-w-4xl mx-auto w-full flex-1 flex flex-col items-center justify-center space-y-5">
        {loading ? (
          <div className="bg-slate-900/90 p-10 rounded-3xl text-center shadow-2xl border border-slate-700 space-y-4 w-full max-w-md">
            <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-black text-amber-300">
              በሲስተሙ ውስጥ መመዝገቡ በመረጋገጥ ላይ ነው...
            </p>
          </div>
        ) : badge && !notFound ? (
          <div className="w-full space-y-5 flex flex-col items-center">
            {/* Concise Validity Confirmation Only */}
            <div
              className={`w-full max-w-2xl px-5 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-2xl border-2 text-center sm:text-left ${
                badge.status === "ACTIVE"
                  ? "bg-emerald-950/95 text-emerald-100 border-emerald-400/70"
                  : "bg-rose-950/95 text-rose-100 border-rose-400/70"
              }`}
            >
              {badge.status === "ACTIVE" ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
              ) : (
                <ShieldAlert className="w-8 h-8 text-rose-400 shrink-0" />
              )}
              <div>
                <h1 className="text-sm sm:text-base font-black tracking-wide">
                  {badge.status === "ACTIVE"
                    ? "✅ ትክክለኛና በሲስተሙ የተመዘገበ የፓትሮል ቅኝት ባጅ ነው"
                    : "⚠️ የተሰረዘ ወይም ጊዜው ያለፈበት ባጅ ነው"}
                </h1>
                <p className="text-xs font-bold text-amber-300 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 inline mr-1 -mt-0.5 text-emerald-400" />
                  አሶሳ ከተማ አስ/ር ወረዳ ሁለት ፖሊስ ጽ/ቤት • ባጅ ቁጥር: {badge.badgeId}
                </p>
              </div>
            </div>

            {/* Front & Back Badge Cards Only */}
            <div className="flex flex-wrap items-center justify-center gap-6 py-2 overflow-visible w-full">
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-black text-amber-300 bg-slate-900 px-3.5 py-1 rounded-full border border-amber-400/40 shadow">
                  የፊት ገፅ (FRONT)
                </span>
                <BadgeCardFront data={badge} scale={0.92} />
              </div>

              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-black text-sky-300 bg-slate-900 px-3.5 py-1 rounded-full border border-sky-400/40 shadow">
                  የኋላ ገፅ (BACK)
                </span>
                <BadgeCardBack data={badge} scale={0.92} />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 p-8 sm:p-10 rounded-3xl text-center shadow-2xl border-2 border-rose-500/70 space-y-3 max-w-md w-full">
            <AlertOctagon className="w-14 h-14 text-rose-400 mx-auto animate-pulse" />
            <h2 className="text-base sm:text-lg font-black text-rose-300">
              ይህ ባጅ ({badgeId}) ከሲስተሙ ተሰርዟል ወይም አልተመዘገበም!
            </h2>
            <p className="text-xs font-bold text-amber-300">
              ባጁ መስራቱን አቁሟል፤ ስካን ማድረግና መጠቀም አይቻልም::
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
