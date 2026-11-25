import React, { useState, useMemo } from "react";
import { BadgeData } from "../types";
import { BadgeCardFront } from "./BadgeCardFront";
import { BadgeCardBack } from "./BadgeCardBack";
import {
  Search,
  Eye,
  Printer,
  Edit,
  Trash2,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  User,
  Briefcase,
  Plus,
  Download,
  Folder,
  FolderOpen,
  Table as TableIcon,
  LayoutGrid,
  AlertTriangle,
  Filter,
  ChevronDown,
  ArrowUpDown,
  X,
} from "lucide-react";

interface BadgeDirectoryProps {
  badges: BadgeData[];
  loading: boolean;
  onEdit: (badge: BadgeData) => void;
  onDelete: (badgeId: string) => void;
  onVerify: (badge: BadgeData) => void;
  onPrint: (badge: BadgeData) => void;
  onCreateNew: () => void;
}

function extractBadgeSequenceNumber(badgeId: string): number {
  const matches = badgeId?.match(/\d+/g);
  if (!matches || matches.length === 0) return Number.MAX_SAFE_INTEGER;
  const parsed = parseInt(matches[matches.length - 1], 10);
  return isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
}

export const BadgeDirectory: React.FC<BadgeDirectoryProps> = ({
  badges,
  loading,
  onEdit,
  onDelete,
  onVerify,
  onPrint,
  onCreateNew,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedKebele, setSelectedKebele] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<
    "BADGE_ID" | "ISSUE_DATE_DESC" | "ISSUE_DATE_ASC" | "ALPHABETICAL"
  >("BADGE_ID");
  const [viewMode, setViewMode] = useState<"TABLE" | "GRID">("TABLE");
  const [selectedBadgeForModal, setSelectedBadgeForModal] =
    useState<BadgeData | null>(null);
  const [activeTabSide, setActiveTabSide] = useState<"FRONT" | "BACK">("FRONT");
  const [badgePendingDelete, setBadgePendingDelete] =
    useState<BadgeData | null>(null);

  // Build Kebele folders sorted sequentially (e.g., Kebele 01, 02, 03...)
  const kebeleFolders = useMemo(() => {
    const map = new Map<
      string,
      { name: string; total: number; active: number; revoked: number }
    >();

    badges.forEach((b) => {
      const kebeleName = b.departmentAmharic?.trim() || "ያልተመደበ ቀበሌ";
      const existing = map.get(kebeleName) || {
        name: kebeleName,
        total: 0,
        active: 0,
        revoked: 0,
      };
      existing.total += 1;
      if (b.status === "ACTIVE") existing.active += 1;
      else existing.revoked += 1;
      map.set(kebeleName, existing);
    });

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true })
    );
  }, [badges]);

  // If the currently open Kebele folder becomes empty after deleting its last badge, return to ALL
  const effectiveSelectedKebele =
    selectedKebele === "ALL" ||
    kebeleFolders.some((f) => f.name === selectedKebele)
      ? selectedKebele
      : "ALL";

  // Filter & sort badges sequentially by badgeId number
  const filteredBadges = useMemo(() => {
    const filtered = badges.filter((badge) => {
      const kebeleName = badge.departmentAmharic?.trim() || "ያልተመደበ ቀበሌ";
      const matchesKebele =
        effectiveSelectedKebele === "ALL" ||
        kebeleName === effectiveSelectedKebele;

      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        badge.fullNameAmharic.toLowerCase().includes(q) ||
        badge.fullNameEnglish.toLowerCase().includes(q) ||
        badge.badgeId.toLowerCase().includes(q) ||
        badge.departmentAmharic.toLowerCase().includes(q) ||
        badge.rankAmharic.toLowerCase().includes(q) ||
        (badge.phoneNumber || "").toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "ALL" || badge.status === statusFilter;

      return matchesKebele && matchesSearch && matchesStatus;
    });

    // Apply selected directory sort order
    return [...filtered].sort((a, b) => {
      if (sortBy === "ALPHABETICAL") {
        const nameA = (a.fullNameAmharic || a.fullNameEnglish || "").trim();
        const nameB = (b.fullNameAmharic || b.fullNameEnglish || "").trim();
        const cmp = nameA.localeCompare(nameB, undefined, {
          sensitivity: "base",
        });
        if (cmp !== 0) return cmp;
      } else if (sortBy === "ISSUE_DATE_DESC") {
        const dateA = new Date(a.issueDate || a.createdAt || 0).getTime();
        const dateB = new Date(b.issueDate || b.createdAt || 0).getTime();
        if (dateA !== dateB) return dateB - dateA;
      } else if (sortBy === "ISSUE_DATE_ASC") {
        const dateA = new Date(a.issueDate || a.createdAt || 0).getTime();
        const dateB = new Date(b.issueDate || b.createdAt || 0).getTime();
        if (dateA !== dateB) return dateA - dateB;
      }

      const numA = extractBadgeSequenceNumber(a.badgeId);
      const numB = extractBadgeSequenceNumber(b.badgeId);
      if (numA !== numB) return numA - numB;
      return (
        new Date(a.createdAt || 0).getTime() -
        new Date(b.createdAt || 0).getTime()
      );
    });
  }, [badges, effectiveSelectedKebele, searchTerm, statusFilter, sortBy]);

  const totalCount = badges.length;
  const activeCount = badges.filter((b) => b.status === "ACTIVE").length;
  const revokedCount = badges.filter((b) => b.status !== "ACTIVE").length;

  // Export badge directory to UTF-8 BOM CSV for Excel/offline archival
  const handleExportCsv = () => {
    const recordsToExport = filteredBadges.length > 0 ? filteredBadges : badges;
    if (recordsToExport.length === 0) return;

    const escapeCsvField = (value: string | undefined | null) => {
      const str = String(value ?? "");
      const escaped = str.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const headers = [
      "Seq #",
      "Badge ID",
      "Full Name (Amharic)",
      "Full Name (English)",
      "Kebele / Patrol Unit (Amharic)",
      "Kebele / Patrol Unit (English)",
      "Patrol Role (Amharic)",
      "Patrol Role (English)",
      "Phone Number",
      "Status",
      "Issue Date",
      "Expiry Date",
      "Created At",
      "Updated At",
    ];

    const rows = recordsToExport.map((b, idx) =>
      [
        escapeCsvField(String(idx + 1)),
        escapeCsvField(b.badgeId),
        escapeCsvField(b.fullNameAmharic),
        escapeCsvField(b.fullNameEnglish),
        escapeCsvField(b.departmentAmharic),
        escapeCsvField(b.departmentEnglish),
        escapeCsvField(b.rankAmharic),
        escapeCsvField(b.rankEnglish),
        escapeCsvField(b.phoneNumber),
        escapeCsvField(b.status),
        escapeCsvField(b.issueDate),
        escapeCsvField(b.expiryDate),
        escapeCsvField(b.createdAt),
        escapeCsvField(b.updatedAt || ""),
      ].join(",")
    );

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    const today = new Date().toISOString().split("T")[0];
    link.href = url;
    link.setAttribute("download", `assosa-woreda2-patrol-badges-${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Badges */}
        <div className="bg-[#1e293b] p-4 rounded-2xl border border-slate-700/80 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black text-sky-300 block">
              ጠቅላላ የተመዘገቡ
            </span>
            <span className="text-2xl font-black text-white font-mono">
              {totalCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-blue-400">
            <User className="w-5 h-5" />
          </div>
        </div>

        {/* Active Badges */}
        <div className="bg-[#1e293b] p-4 rounded-2xl border border-slate-700/80 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black text-emerald-300 block">
              ኦፊሴላዊ የፀኑ ባጆች
            </span>
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {activeCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Revoked Badges */}
        <div className="bg-[#1e293b] p-4 rounded-2xl border border-slate-700/80 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black text-rose-300 block">
              የተሰረዙ / ያበቁ
            </span>
            <span className="text-2xl font-black text-rose-400 font-mono">
              {revokedCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-400/30 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        {/* Quick New Registration */}
        <div
          onClick={onCreateNew}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 p-4 rounded-2xl border border-blue-400/40 shadow-lg flex items-center justify-between cursor-pointer transition transform hover:-translate-y-0.5 select-none"
        >
          <div>
            <span className="text-[11px] font-black text-amber-200 block">
              አዲስ መዝግብ
            </span>
            <span className="text-sm font-black text-white">አዲስ ባጅ ማውጫ</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
            <Plus className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Kebele Folders Grid */}
      <div className="bg-[#1e293b] p-4 sm:p-5 rounded-2xl shadow-xl border border-slate-700/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-black text-amber-300">
              የቀበሌ ፎልደሮች (Kebele Badge Folders)
            </h3>
          </div>
          <span className="text-[11px] font-bold text-sky-300">
            የሚፈልጉትን ቀበሌ ፎልደር ክሊክ በማድረግ በውስጡ ያሉትን ባጆች በቅደም ተከተል ይመልከቱ
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* All Kebeles Folder */}
          <button
            type="button"
            onClick={() => setSelectedKebele("ALL")}
            className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-3 ${
              effectiveSelectedKebele === "ALL"
                ? "bg-amber-500/15 border-amber-400 shadow-lg ring-1 ring-amber-400/40"
                : "bg-slate-900/80 border-slate-700 hover:border-sky-500/60"
            }`}
          >
            {effectiveSelectedKebele === "ALL" ? (
              <FolderOpen className="w-7 h-7 text-amber-400 shrink-0" />
            ) : (
              <Folder className="w-7 h-7 text-sky-400 shrink-0" />
            )}
            <div className="min-w-0">
              <span className="text-xs font-black text-white block truncate">
                ሁሉም ቀበሌዎች
              </span>
              <span className="text-[11px] font-black text-amber-300 font-mono">
                {totalCount} ባጆች
              </span>
            </div>
          </button>

          {/* Individual Kebele Folders */}
          {kebeleFolders.map((folder) => {
            const isOpen = effectiveSelectedKebele === folder.name;
            return (
              <button
                key={folder.name}
                type="button"
                onClick={() => setSelectedKebele(folder.name)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-3 ${
                  isOpen
                    ? "bg-amber-500/15 border-amber-400 shadow-lg ring-1 ring-amber-400/40"
                    : "bg-slate-900/80 border-slate-700 hover:border-sky-500/60"
                }`}
              >
                {isOpen ? (
                  <FolderOpen className="w-7 h-7 text-amber-400 shrink-0" />
                ) : (
                  <Folder className="w-7 h-7 text-sky-400 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-black text-white block truncate">
                    {folder.name}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] font-black font-mono mt-0.5">
                    <span className="text-emerald-300">{folder.total} ባጆች</span>
                    {folder.revoked > 0 && (
                      <span className="text-rose-400">({folder.revoked} የተሰረዙ)</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search, Kebele Filter, Sort, View Mode, Export & Status Filter Bar */}
      <div className="bg-[#1e293b] p-4 rounded-2xl shadow-xl border border-slate-700/80 flex flex-col gap-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full">
          {/* Search Input by Name or Badge ID */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400" />
            <input
              type="text"
              aria-label="Search patrol members by name or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="በአባሉ ስም ወይም ባጅ ቁጥር ይፈልጉ... (Search by Name or ID)"
              className="w-full pl-10 pr-9 py-2.5 text-xs font-bold bg-slate-900/90 text-white placeholder-slate-400 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-md cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Kebele Dropdown Filter */}
          <div className="relative w-full md:w-60 shrink-0">
            <Filter className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none" />
            <select
              aria-label="በቀበሌ ይምረጡ / Filter by Kebele"
              value={effectiveSelectedKebele}
              onChange={(e) => setSelectedKebele(e.target.value)}
              className={`w-full appearance-none pl-10 pr-9 py-2.5 text-xs font-black rounded-xl border focus:ring-2 focus:ring-amber-400 focus:outline-none cursor-pointer transition ${
                effectiveSelectedKebele !== "ALL"
                  ? "bg-amber-500/15 text-amber-200 border-amber-400/70"
                  : "bg-slate-900/90 text-sky-200 border-slate-700 hover:border-sky-500/60"
              }`}
            >
              <option value="ALL" className="bg-slate-900 text-white font-bold">
                ሁሉም ቀበሌዎች / All Kebeles ({totalCount})
              </option>
              {kebeleFolders.map((folder) => (
                <option
                  key={folder.name}
                  value={folder.name}
                  className="bg-slate-900 text-white font-bold"
                >
                  {folder.name} ({folder.total})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-amber-300 pointer-events-none" />
          </div>

          {/* Sort Options Dropdown */}
          <div className="relative w-full md:w-64 shrink-0">
            <ArrowUpDown className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none" />
            <select
              aria-label="Sort directory"
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as
                    | "BADGE_ID"
                    | "ISSUE_DATE_DESC"
                    | "ISSUE_DATE_ASC"
                    | "ALPHABETICAL"
                )
              }
              className="w-full appearance-none pl-10 pr-9 py-2.5 text-xs font-black rounded-xl border bg-slate-900/90 text-emerald-200 border-slate-700 hover:border-emerald-500/60 focus:ring-2 focus:ring-emerald-400 focus:outline-none cursor-pointer transition"
            >
              <option value="BADGE_ID" className="bg-slate-900 text-white font-bold">
                ቅደም ተከተል: በባጅ ቁጥር (Badge ID)
              </option>
              <option value="ISSUE_DATE_DESC" className="bg-slate-900 text-white font-bold">
                በተሰጠበት ቀን (አዲስ) / Issue Date (Newest)
              </option>
              <option value="ISSUE_DATE_ASC" className="bg-slate-900 text-white font-bold">
                በተሰጠበት ቀን (ቀዳሚ) / Issue Date (Oldest)
              </option>
              <option value="ALPHABETICAL" className="bg-slate-900 text-white font-bold">
                በፊደል ቅደም ተከተል / Alphabetical Order
              </option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-emerald-300 pointer-events-none" />
          </div>
        </div>

        {/* Status Filter Tabs, View Switcher & CSV Export */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full lg:w-auto">
          <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-900/80 p-1 rounded-xl border border-slate-700/80">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 text-xs font-black rounded-lg transition cursor-pointer ${
                statusFilter === "ALL"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              ሁሉም ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter("ACTIVE")}
              className={`px-3 py-1.5 text-xs font-black rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                statusFilter === "ACTIVE"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-emerald-300 hover:text-emerald-200"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              ኦፊሴላዊ ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter("REVOKED")}
              className={`px-3 py-1.5 text-xs font-black rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                statusFilter === "REVOKED"
                  ? "bg-rose-600 text-white shadow"
                  : "text-rose-300 hover:text-rose-200"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              የተሰረዙ ({revokedCount})
            </button>
          </div>

          {/* Table / Grid View Toggle */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-700/80">
            <button
              type="button"
              onClick={() => setViewMode("TABLE")}
              className={`px-2.5 py-1.5 text-xs font-black rounded-lg transition flex items-center gap-1 cursor-pointer ${
                viewMode === "TABLE"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-sky-200 hover:text-white"
              }`}
              title="በሰንጠረዥ እይታ (Table View)"
            >
              <TableIcon className="w-3.5 h-3.5" />
              ሰንጠረዥ
            </button>
            <button
              type="button"
              onClick={() => setViewMode("GRID")}
              className={`px-2.5 py-1.5 text-xs font-black rounded-lg transition flex items-center gap-1 cursor-pointer ${
                viewMode === "GRID"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-sky-200 hover:text-white"
              }`}
              title="በካርድ እይታ (Grid View)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              ካርድ
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={badges.length === 0}
            title="ሁሉንም የፓትሮል ቅኝት አባላት መረጃ በCSV ፋይል አውርድ"
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg border border-emerald-400/40 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Download className="w-4 h-4 text-amber-200" />
            <span>CSV አውርድ ({filteredBadges.length})</span>
          </button>
        </div>
      </div>

      {/* Directory Content: Sequential Table or Card Grid */}
      {loading ? (
        <div className="bg-[#1e293b] p-12 rounded-xl text-center border border-slate-700 shadow-xl">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-black text-sky-300">
            መረጃዎች ከፋየርስቶር ዳታቤዝ በመጫን ላይ ናቸው...
          </p>
        </div>
      ) : filteredBadges.length === 0 ? (
        <div className="bg-[#1e293b] p-12 rounded-xl text-center border border-slate-700 shadow-xl">
          <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h3 className="text-base font-black text-white">
            ምንም የተመዘገበ የፖሊስ ባጅ አልተገኘም
          </h3>
          <p className="text-xs font-bold text-sky-300 mt-1 max-w-md mx-auto">
            አዲስ የፖሊስ ባጅ ለመመዝገብ ከላይ ያለውን "አዲስ ባጅ ማውጫ" የሚለውን ቁልፍ ይጫኑ::
          </p>
        </div>
      ) : viewMode === "TABLE" ? (
        <div className="bg-[#1e293b] rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
          {/* Active Folder Header Strip */}
          <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-amber-400" />
              <h4 className="text-sm font-black text-amber-300">
                {effectiveSelectedKebele === "ALL"
                  ? "ሁሉም ቀበሌዎች — በቅደም ተከተል የተመዘገቡ ባጆች ሰንጠረዥ"
                  : `${effectiveSelectedKebele} — የቀበሌ ፎልደር ሰንጠረዥ`}
              </h4>
            </div>
            <span className="text-xs font-black text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-3 py-1 rounded-full self-start sm:self-auto">
              ጠቅላላ: {filteredBadges.length} ባጆች (ባጁን ለማየት ረድፉን ክሊክ ያድርጉ)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-700 text-[11px] font-black uppercase text-sky-300 tracking-wide">
                  <th className="py-3 px-4 w-14 text-center">ተ.ቁ</th>
                  <th className="py-3 px-4">የባጅ ቁጥር</th>
                  <th className="py-3 px-4">ፎቶና ሙሉ ስም</th>
                  <th className="py-3 px-4">ቀበሌ እና ድርሻ</th>
                  <th className="py-3 px-4">ስልክ እና ቀን</th>
                  <th className="py-3 px-4 text-center">ሁኔታ</th>
                  <th className="py-3 px-4 text-right">ተግባራት (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/70 text-xs">
                {filteredBadges.map((badge, index) => (
                  <tr
                    key={badge.id || badge.badgeId}
                    onClick={() => setSelectedBadgeForModal(badge)}
                    title="ባጁን ለማየት ክሊክ ያድርጉ"
                    className="hover:bg-blue-950/40 transition cursor-pointer group"
                  >
                    {/* Sequential Index */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-400/40 text-amber-300 font-mono font-black text-xs">
                        {index + 1}
                      </span>
                    </td>

                    {/* Badge ID */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-blue-600/20 border border-blue-400/40 text-sky-300 font-mono font-black rounded-lg">
                        {badge.badgeId}
                      </span>
                    </td>

                    {/* Photo & Full Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 rounded-lg bg-slate-800 border border-slate-600 overflow-hidden shrink-0 shadow">
                          {badge.headshotPhoto ? (
                            <img
                              src={badge.headshotPhoto}
                              alt={badge.fullNameAmharic}
                              className="w-full h-full object-cover object-top"
                            />
                          ) : (
                            <User className="w-5 h-5 text-slate-400 m-auto mt-3" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-white text-sm group-hover:text-amber-300 transition truncate max-w-[200px]">
                            {badge.fullNameAmharic}
                          </p>
                          <p className="font-bold text-amber-200 text-[11px] truncate max-w-[200px]">
                            {badge.fullNameEnglish}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Kebele & Role */}
                    <td className="py-3 px-4">
                      <p className="font-black text-sky-200 truncate max-w-[180px]">
                        {badge.departmentAmharic}
                      </p>
                      <p className="font-bold text-amber-300 text-[11px] truncate max-w-[180px]">
                        {badge.rankAmharic}
                      </p>
                    </td>

                    {/* Phone & Dates */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <p className="font-mono font-black text-emerald-300">
                        {badge.phoneNumber}
                      </p>
                      <p className="font-mono font-bold text-slate-300 text-[10px]">
                        {badge.issueDate} → {badge.expiryDate}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase border ${
                          badge.status === "ACTIVE"
                            ? "bg-emerald-500/15 border-emerald-400/50 text-emerald-300"
                            : "bg-rose-500/15 border-rose-400/50 text-rose-300"
                        }`}
                      >
                        {badge.status}
                      </span>
                    </td>

                    {/* Row Actions */}
                    <td
                      className="py-3 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedBadgeForModal(badge)}
                          title="ባጁን እይ (View)"
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-sky-300 font-black text-[11px] rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>እይ</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onPrint(badge)}
                          title="በኤቲኤም ሳይዝ አትም (Print)"
                          className="px-2.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 font-black text-[11px] rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>አትም</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onEdit(badge)}
                          title="አስተካክል (Edit)"
                          className="px-2.5 py-1.5 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-400/40 text-sky-300 font-black text-[11px] rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>አስተካክል</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setBadgePendingDelete(badge)}
                          title="ከሲስተሙ አጥፋ (Delete)"
                          className="px-2.5 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/40 text-rose-300 font-black text-[11px] rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>አጥፋ</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBadges.map((badge, index) => (
            <div
              key={badge.id || badge.badgeId}
              onClick={() => setSelectedBadgeForModal(badge)}
              className="bg-[#1e293b] rounded-xl p-4 border border-slate-700 shadow-xl hover:border-amber-400/60 transition flex flex-col justify-between space-y-4 cursor-pointer"
            >
              {/* Officer Header Card Preview */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
                <div className="w-16 h-20 bg-slate-800 rounded-lg border border-slate-600 overflow-hidden shrink-0 shadow">
                  {badge.headshotPhoto ? (
                    <img
                      src={badge.headshotPhoto}
                      alt={badge.fullNameAmharic}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <User className="w-8 h-8 text-slate-500 m-auto mt-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1">
                      <span className="px-1.5 py-0.5 bg-amber-500/15 border border-amber-400/40 text-amber-300 text-[10px] font-mono font-black rounded">
                        #{index + 1}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-600/20 border border-blue-500/30 text-sky-300 text-[10px] font-mono font-black rounded uppercase">
                        {badge.badgeId}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[9px] font-black rounded-full uppercase border ${
                        badge.status === "ACTIVE"
                          ? "bg-green-500/10 border-green-500/30 text-green-400"
                          : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                      }`}
                    >
                      {badge.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-white truncate font-sans">
                    {badge.fullNameAmharic}
                  </h4>
                  <p className="text-xs font-bold text-amber-300 truncate">
                    {badge.fullNameEnglish}
                  </p>

                  <div className="mt-1 flex items-center gap-1 text-[11px] font-black text-sky-400">
                    <Briefcase className="w-3 h-3" />
                    <span className="truncate">{badge.rankAmharic}</span>
                  </div>
                </div>
              </div>

              {/* Quick Details */}
              <div className="text-xs space-y-1.5 text-slate-100 bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <div className="flex justify-between">
                  <span className="font-black text-sky-300">ቀበሌ / Kebele:</span>
                  <span className="font-black text-amber-200 truncate max-w-[160px]">
                    {badge.departmentAmharic}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-black text-sky-300">ስልክ / Phone:</span>
                  <span className="font-mono font-black text-emerald-300">
                    {badge.phoneNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-black text-sky-300">የተሰጠበት / Issued:</span>
                  <span className="font-mono font-bold text-white">
                    {badge.issueDate}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                className="grid grid-cols-4 gap-1.5 pt-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setSelectedBadgeForModal(badge)}
                  title="ባጁን እይ (Preview Front & Back)"
                  className="py-2 px-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-sky-200 text-[11px] font-black rounded-lg transition flex flex-col items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-sky-400" />
                  <span>እይ</span>
                </button>

                <button
                  type="button"
                  onClick={() => onPrint(badge)}
                  title="ባጁን አትም (Print)"
                  className="py-2 px-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-black rounded-lg transition flex flex-col items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>አትም</span>
                </button>

                <button
                  type="button"
                  onClick={() => onEdit(badge)}
                  title="አስተካክል (Edit)"
                  className="py-2 px-1 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-sky-300 text-[11px] font-black rounded-lg transition flex flex-col items-center gap-1 cursor-pointer"
                >
                  <Edit className="w-4 h-4 text-blue-400" />
                  <span>አስተካክል</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBadgePendingDelete(badge)}
                  title="አጥፋ (Delete)"
                  className="py-2 px-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] font-black rounded-lg transition flex flex-col items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>አጥፋ</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Front & Back Badge Modal */}
      {selectedBadgeForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1e293b] text-slate-100 rounded-2xl max-w-2xl w-full p-6 border-2 border-amber-400/50 shadow-2xl relative space-y-5">
            <button
              onClick={() => setSelectedBadgeForModal(null)}
              className="absolute top-4 right-4 text-sky-300 hover:text-white bg-slate-800 p-2 rounded-full transition cursor-pointer font-black"
            >
              ✕
            </button>

            <div className="text-center">
              <h3 className="text-lg font-black text-amber-300">
                የፖሊስ ባጅ ካርድ እይታ / Badge Card Preview
              </h3>
              <p className="text-xs font-black text-sky-300 mt-0.5 font-mono">
                {selectedBadgeForModal.fullNameAmharic} ({selectedBadgeForModal.badgeId}) — {selectedBadgeForModal.departmentAmharic}
              </p>
            </div>

            {/* Toggle Front / Back View */}
            <div className="flex justify-center bg-slate-900 p-1 rounded-xl max-w-xs mx-auto border border-slate-700">
              <button
                onClick={() => setActiveTabSide("FRONT")}
                className={`flex-1 py-1.5 text-xs font-black rounded-lg transition cursor-pointer ${
                  activeTabSide === "FRONT"
                    ? "bg-blue-600 text-white shadow"
                    : "text-sky-200 hover:text-white"
                }`}
              >
                የፊት ገፅ (Front)
              </button>
              <button
                onClick={() => setActiveTabSide("BACK")}
                className={`flex-1 py-1.5 text-xs font-black rounded-lg transition cursor-pointer ${
                  activeTabSide === "BACK"
                    ? "bg-blue-600 text-white shadow"
                    : "text-sky-200 hover:text-white"
                }`}
              >
                የኋላ ገፅ (Back)
              </button>
            </div>

            {/* Card Render */}
            <div className="flex justify-center py-2 overflow-visible">
              {activeTabSide === "FRONT" ? (
                <BadgeCardFront data={selectedBadgeForModal} scale={0.95} />
              ) : (
                <BadgeCardBack data={selectedBadgeForModal} scale={0.95} />
              )}
            </div>

            <div className="flex flex-wrap justify-between items-center gap-2 pt-3 border-t border-slate-700">
              <button
                onClick={() => {
                  onVerify(selectedBadgeForModal);
                  setSelectedBadgeForModal(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                የQR ማረጋገጫ
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onEdit(selectedBadgeForModal);
                    setSelectedBadgeForModal(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-600 font-black text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                  አስተካክል
                </button>

                <button
                  onClick={() => {
                    onPrint(selectedBadgeForModal);
                    setSelectedBadgeForModal(null);
                  }}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  በኤቲኤም ሳይዝ አትም
                </button>

                <button
                  onClick={() => {
                    const target = selectedBadgeForModal;
                    setSelectedBadgeForModal(null);
                    setBadgePendingDelete(target);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  አጥፋ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* In-App Permanent Delete Confirmation Modal */}
      {badgePendingDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e293b] text-white rounded-2xl max-w-md w-full p-6 border-2 border-rose-500/70 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-rose-300">
                  ባጁን ሙሉ በሙሉ ማጥፋት ይፈልጋሉ?
                </h3>
                <p className="text-xs font-bold text-amber-300">
                  {badgePendingDelete.fullNameAmharic} ({badgePendingDelete.badgeId})
                </p>
              </div>
            </div>

            <p className="text-xs font-bold text-sky-200 leading-relaxed bg-slate-900/90 p-3.5 rounded-xl border border-slate-700">
              ይህ ባጅ አንዴ ከተሰረዘ ከሲስተሙና ከፋየርስቶር ሙሉ በሙሉ ይጠፋል፤ ከአሁን በኋላ ባጁ መስራቱን ያቆማል እንዲሁም QR ኮዱን ስካን ማድረግ አይቻልም::
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBadgePendingDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-200 font-black text-xs rounded-xl border border-slate-600 cursor-pointer"
              >
                ተመለስ / Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const idToDelete =
                    badgePendingDelete.id || badgePendingDelete.badgeId;
                  setBadgePendingDelete(null);
                  onDelete(idToDelete);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                አዎ፣ ሙሉ በሙሉ አጥፋ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
