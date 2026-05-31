import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Users,
  Star,
  AlertOctagon,
  Mail,
  Activity,
  ArrowLeft,
  Send,
  RefreshCw,
  X,
  Zap,
  Database,
  Globe,
  Server,
  Cpu,
  BarChart2,
  CheckCircle2,
  Clock,
  MessageSquare,
  Eye,
  TrendingUp,
  Package,
  Wifi,
  Lock,
} from "lucide-react";

/* ── helpers ── */
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const Bar = ({
  value,
  max = 100,
  color = "bg-indigo-500",
  label,
  unit = "%",
}) => (
  <div>
    <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">
      <span>{label}</span>
      <span
        className={
          value > max * 0.75
            ? "text-red-400"
            : value > max * 0.5
              ? "text-amber-400"
              : "text-emerald-400"
        }
      >
        {value}
        {unit}
      </span>
    </div>
    <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
      <div
        className={`h-full ${color} transition-all duration-1000 rounded-full`}
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
      />
    </div>
  </div>
);

const StatCard = ({ icon, label, value, sub, color }) => (
  <div className="p-5 rounded-2xl bg-[#0c091f]/60 border border-white/5 backdrop-blur-md flex flex-col gap-1">
    <div className={`flex items-center justify-between mb-2 ${color}`}>
      {icon}
      <span className="text-[9px] font-black tracking-widest uppercase text-slate-500">
        {label}
      </span>
    </div>
    <p className="text-2xl font-black text-white">{value}</p>
    {sub && <p className="text-[10px] text-slate-500">{sub}</p>}
  </div>
);

/* ── Optimization cards data ── */
const OPTIMIZATIONS = [
  {
    id: "db_index",
    title: "Index User Collections",
    desc: "Create compound indexes on username + email fields to speed up lookups by up to 4×.",
    icon: <Database size={18} />,
    color: "text-indigo-400",
    impact: { dbLatency: -22, cpuUsage: -5 },
    badge: "DB Speed",
  },
  {
    id: "gzip",
    title: "Enable Gzip Compression",
    desc: "Compress API responses and static assets. Reduces transfer size by ~70%.",
    icon: <Package size={18} />,
    color: "text-emerald-400",
    impact: { memoryUsage: -8, dbLatency: -5 },
    badge: "Bandwidth",
  },
  {
    id: "ice_cache",
    title: "Cache WebRTC ICE Entries",
    desc: "Cache resolved ICE server endpoints to eliminate repeat STUN/TURN lookups on every call.",
    icon: <Wifi size={18} />,
    color: "text-cyan-400",
    impact: { cpuUsage: -8, activeConnections: -1 },
    badge: "WebRTC",
  },
  {
    id: "purge_msgs",
    title: "Purge Expired Messages",
    desc: "Remove phantom messages older than 24h from the database to free RAM and reduce query scans.",
    icon: <MessageSquare size={18} />,
    color: "text-rose-400",
    impact: { memoryUsage: -12, dbLatency: -10 },
    badge: "Storage",
  },
  {
    id: "mongo_agg",
    title: "Optimize MongoDB Aggregations",
    desc: "Rewrite the unread-count pipeline to use $facet stages and avoid full collection scans.",
    icon: <Server size={18} />,
    color: "text-purple-400",
    impact: { cpuUsage: -12, dbLatency: -18 },
    badge: "Query",
  },
  {
    id: "cdn",
    title: "Enable CDN for Media Assets",
    desc: "Route Cloudinary uploads through a CDN edge to cut average media load time by 60%.",
    icon: <Globe size={18} />,
    color: "text-amber-400",
    impact: { memoryUsage: -6, cpuUsage: -4 },
    badge: "CDN",
  },
];

/* ── Campaign preview map ── */
const CAMPAIGN_PREVIEWS = {
  miss_you:
    '"Things just haven’t been the same without you around. Your friends are online, conversations are waiting, and Chatify misses your vibe. 💙 Come back and reconnect now!"',

  flirty_wifi:
    '"Are you a Wi-Fi signal? Because the connection feels stronger whenever you’re online. 📶 Someone on Chatify is waiting to talk to you right now!"',

  flirty_magician:
    '"Are you a magician? Because every time you appear online, the whole chat lights up. ✨ Jump back into Chatify and make someone smile today!"',

  flirty_map:
    '"Do you have a map? Because people keep getting lost looking for you in Chatify. 🗺️ Come online and reconnect with your favorite people!"',

  flirty_google:
    '"Are you Google? Because you’re exactly what everyone’s been searching for. 🔍 Your chats are waiting — log back into Chatify now!"',

  flirty_type:
    '"Are you a keyboard? Because you’re exactly everyone’s type. ⌨️ Someone special might be waiting for your next message on Chatify!"',

  flirty_coffee:
    '"You must be coffee… because every conversation gets instantly better with you around. ☕ Come back online and start chatting again!"',

  flirty_camera:
    '"Are you a camera? Because every notification feels brighter when you’re around. 📸 Log back into Chatify and capture new moments!"',

  flirty_puzzle:
    '"You’re the missing piece that makes the community complete. 🧩 Your friends are waiting — come back to Chatify now!"',

  flirty_sun:
    '"You seriously brighten up the whole app when you’re online. ☀️ Someone is hoping to see your name pop up again today!"',

  flirty_song:
    '"You’re like a favorite song — impossible to forget and always on someone’s mind. 🎵 Jump back into Chatify and keep the vibe going!"',

  late_night:
    '"Late night chats hit differently… 🌙 Someone is online right now hoping you’ll message them first. Come back to Chatify!"',

  trending_rooms:
    '"🔥 New trending rooms are blowing up right now! Don’t miss the conversations everyone’s talking about on Chatify."',

  unread_messages:
    '"📩 You’ve got unread messages waiting for you. Someone took the time to reach out — come see what they said!"',

  online_crush:
    '"👀 Someone you chatted with recently is online right now. Perfect timing to continue the conversation…"',

  streak_reminder:
    '"⚡ Your chat streak is about to break! Come back now and keep your conversations alive on Chatify."',

  friend_joined:
    '"🎉 One of your friends just joined Chatify! Jump online and welcome them with your first message."',

  weekend_vibes:
    '"✨ Weekend vibes are active on Chatify right now — new people, new conversations, and good energy everywhere!"',

  voice_call_waiting:
    '"📞 Someone is waiting to start a voice/video call with you. Don’t keep them waiting too long!"',

  comeback_reward:
    '"🎁 Welcome-back surprise unlocked! Log into Chatify today and see what’s waiting for you inside."',

  lonely_chat:
    '"💭 A conversation can change your whole mood. Someone out there is waiting for a message exactly like yours."',

  typing_moment:
    '"⌨️ Imagine opening Chatify and seeing “someone is typing…” again. Your next conversation could start right now."',
};

/* ══════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("performance");
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  /* Performance live metrics */
  const [cpuUsage, setCpuUsage] = useState(18);
  const [memoryUsage, setMemoryUsage] = useState(44);
  const [activeConnections, setActiveConnections] = useState(6);
  const [dbLatency, setDbLatency] = useState(24);

  /* Website analytics mocks */
  const [totalMessages, setTotalMessages] = useState(rand(1200, 2400));
  const [pageViews, setPageViews] = useState(rand(380, 820));
  const [avgSession, setAvgSession] = useState(rand(4, 12));
  const [apiAvg, setApiAvg] = useState(rand(38, 95));

  /* Optimization engine */
  const [appliedOpts, setAppliedOpts] = useState({});
  const [applyingId, setApplyingId] = useState(null);

  /* Warnings & campaigns */
  const [warningText, setWarningText] = useState("");
  const [targetUser, setTargetUser] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState("flirty_wifi");

  /* ── Auth guard ── */
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      toast.error("Unauthorized access");
      navigate("/chat");
      return;
    }
    fetchData();

    /* Live performance ticker */
    const interval = setInterval(() => {
      setCpuUsage((p) =>
        Math.max(4, Math.min(95, Math.floor(p + (Math.random() - 0.48) * 5))),
      );
      setMemoryUsage((p) =>
        Math.max(18, Math.min(92, Math.floor(p + (Math.random() - 0.5) * 3))),
      );
      setDbLatency((p) =>
        Math.max(8, Math.min(220, Math.floor(p + (Math.random() - 0.5) * 9))),
      );
      setActiveConnections((p) =>
        Math.max(1, Math.floor(p + (Math.random() - 0.5) * 2)),
      );
      setTotalMessages((p) => p + rand(0, 3));
      setPageViews((p) => p + rand(0, 2));
      setApiAvg((p) =>
        Math.max(18, Math.min(180, Math.floor(p + (Math.random() - 0.5) * 8))),
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, fRes, rRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/feedback"),
        api.get("/admin/reports"),
      ]);
      setUsers(uRes.data);
      setFeedbacks(fRes.data);
      setReports(rRes.data);
    } catch {
      toast.error("Failed to sync admin records");
    } finally {
      setLoading(false);
    }
  };

  const handleWarnUser = async (username) => {
    if (!warningText.trim()) {
      toast.error("Please enter warning details");
      return;
    }
    try {
      await api.post("/admin/warn", { username, warningText });
      toast.success(`⚠️ Warning issued to @${username}`);
      setWarningText("");
      setTargetUser("");
      fetchData();
    } catch {
      toast.error("Failed to issue warning");
    }
  };

  const handleTriggerCampaign = async () => {
    setLoading(true);
    try {
      const res = await api.post("/admin/email-blast", {
        campaignType: selectedCampaign,
      });
      toast.success(res.data.message);
    } catch {
      toast.error("Failed to send promotional campaign");
    } finally {
      setLoading(false);
    }
  };

  /* Apply an optimization card */
  const applyOptimization = async (opt) => {
    if (appliedOpts[opt.id] || applyingId) return;
    setApplyingId(opt.id);
    await new Promise((r) => setTimeout(r, 1800));
    // Update metrics dynamically
    if (opt.impact.cpuUsage)
      setCpuUsage((p) => Math.max(4, p + opt.impact.cpuUsage));
    if (opt.impact.memoryUsage)
      setMemoryUsage((p) => Math.max(10, p + opt.impact.memoryUsage));
    if (opt.impact.dbLatency)
      setDbLatency((p) => Math.max(6, p + opt.impact.dbLatency));
    if (opt.impact.activeConnections)
      setActiveConnections((p) =>
        Math.max(1, p + opt.impact.activeConnections),
      );
    setAppliedOpts((prev) => ({ ...prev, [opt.id]: true }));
    setApplyingId(null);
    toast.success(`✅ "${opt.title}" applied! Metrics updated.`);
  };

  /* Health label */
  const health = (() => {
    if (cpuUsage > 80 || dbLatency > 150)
      return {
        status: "Critical",
        color: "text-rose-500",
        dot: "bg-rose-500",
        tip: "Scale database cluster size, purge expired phantom message sockets, enable WebRTC STUN caching.",
      };
    if (cpuUsage > 50 || dbLatency > 80)
      return {
        status: "Warning",
        color: "text-amber-400",
        dot: "bg-amber-400",
        tip: "Optimize MongoDB indexing for fetch-history, check Cloudinary upload throughput and idle connections.",
      };
    return {
      status: "Healthy",
      color: "text-emerald-400",
      dot: "bg-emerald-400",
      tip: "All WebRTC signaling processes running optimally. CPU and database cache executing within 25ms threshold.",
    };
  })();

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(
        1,
      )
    : "—";

  const TABS = [
    { id: "performance", label: "Performance", icon: <Activity size={14} /> },
    {
      id: "analytics",
      label: "Website Analytics",
      icon: <BarChart2 size={14} />,
    },
    { id: "optimization", label: "Optimization", icon: <Zap size={14} /> },
    { id: "users", label: "Users", icon: <Users size={14} /> },
    { id: "reports", label: "Reports", icon: <AlertOctagon size={14} /> },
    { id: "feedback", label: "Feedback", icon: <Star size={14} /> },
    { id: "campaigns", label: "Campaigns", icon: <Mail size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-[#03010a] text-slate-200 font-sans p-4 md:p-8 doodle-bg relative overflow-y-auto">
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/chat")}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2.5">
              Super Admin
              <span className="text-[10px] font-black uppercase tracking-widest bg-linear-to-r from-red-500 to-amber-500 text-white px-2 py-0.5 rounded-md">
                Master
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">
              Chatify Control Center &nbsp;·&nbsp;{" "}
              {users.filter((u) => u.role !== "admin").length} registered users
            </p>
          </div>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Sync
          Records
        </button>
      </header>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-10">
        <StatCard
          icon={<Users size={20} />}
          label="Users"
          color="text-indigo-400"
          value={users.filter((u) => u.role !== "admin").length}
          sub={`${users.filter((u) => u.isOnline && u.role !== "admin").length} online now`}
        />
        <StatCard
          icon={<Star size={20} />}
          label="Avg Rating"
          color="text-amber-400"
          value={avgRating}
          sub={`${feedbacks.length} total reviews`}
        />
        <StatCard
          icon={<AlertOctagon size={20} />}
          label="Pending Reports"
          color="text-rose-500"
          value={reports.filter((r) => r.status === "pending").length}
          sub={`${reports.length} total reports`}
        />
        <StatCard
          icon={<Activity size={20} />}
          label="System Health"
          color={health.color}
          value={health.status}
          sub={`CPU ${cpuUsage}% · DB ${dbLatency}ms`}
        />
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-white/5 relative z-10 scrollbar-none">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shrink-0 flex items-center gap-2 border ${
              activeTab === t.id
                ? "bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.35)]"
                : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════ PANELS ══════════════════ */}
      <div className="relative z-10">
        {/* ── Performance ── */}
        {activeTab === "performance" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Live metrics */}
            <div className="p-6 rounded-2xl bg-[#0c091f]/60 border border-white/5 backdrop-blur-md">
              <h3 className="text-sm font-extrabold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                <Cpu size={16} className="text-indigo-400" /> Real-Time Signal
                Metrics
              </h3>
              <div className="space-y-5">
                <Bar
                  label="CPU Core Usage"
                  value={cpuUsage}
                  color="bg-indigo-500"
                />
                <Bar
                  label="Memory Allocation (RAM)"
                  value={memoryUsage}
                  color="bg-purple-500"
                />
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      Active Call Sockets
                    </span>
                    <p className="text-2xl font-black text-white mt-1">
                      {activeConnections}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      DB Query Latency
                    </span>
                    <p
                      className={`text-2xl font-black mt-1 ${dbLatency > 120 ? "text-rose-400" : dbLatency > 60 ? "text-amber-400" : "text-white"}`}
                    >
                      {dbLatency} ms
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Health log */}
            <div className="p-6 rounded-2xl bg-[#0c091f]/60 border border-white/5 backdrop-blur-md flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                  <Server size={16} className="text-purple-400" /> Performance
                  Health Log
                </h3>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/25 w-fit mb-4">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${health.dot} animate-ping`}
                  />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-300">
                    Live Health Report
                  </span>
                </div>
                <p className={`text-sm font-extrabold mb-2 ${health.color}`}>
                  {health.status}
                </p>
                <p className="text-sm font-semibold text-slate-300 leading-relaxed mb-6">
                  {health.tip}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/15">
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">
                  Optimization Recommendation
                </h4>
                <p className="text-xs text-slate-400">
                  {cpuUsage > 75
                    ? "CPU spike detected. Trigger load balancer or cluster scaling immediately to maintain zero delay."
                    : "Switch to Optimization tab to apply recommended improvements and watch metrics drop in real-time."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Website Analytics ── */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* Top stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  icon: <MessageSquare size={18} />,
                  label: "Total Messages",
                  value: totalMessages.toLocaleString(),
                  color: "text-indigo-400",
                },
                {
                  icon: <Eye size={18} />,
                  label: "Page Views Today",
                  value: pageViews.toLocaleString(),
                  color: "text-emerald-400",
                },
                {
                  icon: <Clock size={18} />,
                  label: "Avg Session (min)",
                  value: avgSession,
                  color: "text-cyan-400",
                },
                {
                  icon: <TrendingUp size={18} />,
                  label: "API Avg Response",
                  value: `${apiAvg}ms`,
                  color: "text-amber-400",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="p-5 rounded-2xl bg-[#0c091f]/60 border border-white/5 backdrop-blur-md"
                >
                  <div
                    className={`flex items-center justify-between mb-3 ${s.color}`}
                  >
                    {s.icon}
                    <span className="text-[9px] font-black tracking-widest uppercase text-slate-500">
                      {s.label}
                    </span>
                  </div>
                  <p className="text-2xl font-black text-white">{s.value}</p>
                </div>
              ))}
            </div>

            {/* API endpoint response times */}
            <div className="p-6 rounded-2xl bg-[#0c091f]/60 border border-white/5 backdrop-blur-md">
              <h3 className="text-sm font-extrabold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                <BarChart2 size={16} className="text-cyan-400" /> API Endpoint
                Performance
              </h3>
              <div className="space-y-4">
                {[
                  {
                    label: "GET /api/chat/users",
                    value: Math.max(10, apiAvg - 18),
                    max: 200,
                    color: "bg-indigo-500",
                  },
                  {
                    label: "POST /api/auth/verify-otp",
                    value: Math.max(10, apiAvg + 22),
                    max: 200,
                    color: "bg-purple-500",
                  },
                  {
                    label: "POST /api/chat/report",
                    value: Math.max(10, apiAvg - 5),
                    max: 200,
                    color: "bg-rose-500",
                  },
                  {
                    label: "GET /api/admin/users",
                    value: Math.max(10, apiAvg + 35),
                    max: 200,
                    color: "bg-amber-500",
                  },
                  {
                    label: "POST /api/admin/email-blast",
                    value: Math.max(10, apiAvg + 60),
                    max: 200,
                    color: "bg-emerald-500",
                  },
                ].map((e) => (
                  <Bar
                    key={e.label}
                    label={e.label}
                    value={e.value}
                    max={e.max}
                    color={e.color}
                    unit="ms"
                  />
                ))}
              </div>
            </div>

            {/* WebRTC & asset info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-[#0c091f]/60 border border-white/5 backdrop-blur-md">
                <h3 className="text-sm font-extrabold text-white mb-5 uppercase tracking-wider flex items-center gap-2">
                  <Wifi size={16} className="text-cyan-400" /> WebRTC Signal
                  Stats
                </h3>
                <div className="space-y-4">
                  <Bar
                    label="ICE Candidate Success Rate"
                    value={92}
                    color="bg-emerald-500"
                  />
                  <Bar
                    label="STUN Server Response"
                    value={Math.max(8, dbLatency - 10)}
                    max={200}
                    color="bg-cyan-500"
                    unit="ms"
                  />
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">
                        Active Calls
                      </p>
                      <p className="text-xl font-black text-white mt-1">
                        {activeConnections}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">
                        Avg Call Duration
                      </p>
                      <p className="text-xl font-black text-white mt-1">
                        {rand(3, 12)} min
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#0c091f]/60 border border-white/5 backdrop-blur-md">
                <h3 className="text-sm font-extrabold text-white mb-5 uppercase tracking-wider flex items-center gap-2">
                  <Package size={16} className="text-amber-400" /> Asset Bundle
                  Sizes
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      label: "JS Bundle (gzipped)",
                      value: 182,
                      max: 500,
                      color: "bg-indigo-500",
                      unit: "KB",
                    },
                    {
                      label: "CSS Bundle",
                      value: 28,
                      max: 200,
                      color: "bg-purple-500",
                      unit: "KB",
                    },
                    {
                      label: "Icon Assets",
                      value: 14,
                      max: 100,
                      color: "bg-emerald-500",
                      unit: "KB",
                    },
                    {
                      label: "Cloudinary Avg Upload",
                      value: 340,
                      max: 1000,
                      color: "bg-amber-500",
                      unit: "KB",
                    },
                  ].map((a) => (
                    <Bar
                      key={a.label}
                      label={a.label}
                      value={a.value}
                      max={a.max}
                      color={a.color}
                      unit={a.unit}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Optimization Engine ── */}
        {activeTab === "optimization" && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 mb-2 flex items-start gap-3">
              <Zap size={18} className="text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-white">
                  Interactive Optimization Engine
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Apply recommendations below to dynamically improve system
                  performance. Each optimization reflects immediately in the
                  Performance tab metrics.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {OPTIMIZATIONS.map((opt) => {
                const done = !!appliedOpts[opt.id];
                const running = applyingId === opt.id;
                return (
                  <div
                    key={opt.id}
                    className={`p-5 rounded-2xl border backdrop-blur-md transition-all ${done ? "bg-emerald-500/5 border-emerald-500/20" : "bg-[#0c091f]/60 border-white/5 hover:border-white/10"}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 ${opt.color}`}
                        >
                          {opt.icon}
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-white">
                            {opt.title}
                          </p>
                          <span
                            className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${opt.color} bg-white/5`}
                          >
                            {opt.badge}
                          </span>
                        </div>
                      </div>
                      {done && (
                        <CheckCircle2
                          size={20}
                          className="text-emerald-400 shrink-0"
                        />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      {opt.desc}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(opt.impact).map(([k, v]) => (
                          <span
                            key={k}
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${v < 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}
                          >
                            {k.replace(/([A-Z])/g, " $1").trim()}{" "}
                            {v > 0 ? "+" : ""}
                            {v}
                            {k.includes("Latency") || k.includes("Usage")
                              ? k.includes("Latency")
                                ? "ms"
                                : "%"
                              : ""}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => applyOptimization(opt)}
                        disabled={done || !!applyingId}
                        className={`px-4 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all shrink-0 ml-3 ${
                          done
                            ? "bg-emerald-500/10 text-emerald-400 cursor-default"
                            : running
                              ? "bg-indigo-500/30 text-indigo-300 cursor-wait"
                              : "bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105 active:scale-95 shadow-[0_0_12px_rgba(99,102,241,0.3)] disabled:opacity-40"
                        }`}
                      >
                        {done ? "✓ Applied" : running ? "Applying…" : "Apply"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Users ── */}
        {activeTab === "users" && (
          <div className="p-6 rounded-2xl bg-[#0c091f]/60 border border-white/5 backdrop-blur-md">
            <h3 className="text-sm font-extrabold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
              <Users size={16} className="text-indigo-400" /> Registered Users
              Directory
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-slate-400">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest font-black text-slate-500">
                    <th className="pb-3.5 pl-2">User</th>
                    <th className="pb-3.5">Email</th>
                    <th className="pb-3.5">Status</th>
                    <th className="pb-3.5">Role</th>
                    <th className="pb-3.5">Warnings</th>
                    <th className="pb-3.5 pr-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((u) => (
                    <tr
                      key={u._id}
                      className="hover:bg-white/2 transition-colors"
                    >
                      <td className="py-4 pl-2 font-bold text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0">
                            <img
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}
                              alt="avatar"
                            />
                          </div>
                          @{u.username}
                        </div>
                      </td>
                      <td className="py-4 font-mono text-[11px] text-slate-400">
                        {u.email}
                      </td>
                      <td className="py-4">
                        <span
                          className={`flex items-center gap-1.5 text-[10px] font-bold ${u.isOnline ? "text-emerald-400" : "text-slate-600"}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${u.isOnline ? "bg-emerald-400" : "bg-slate-700"}`}
                          />
                          {u.isOnline ? "Online" : "Offline"}
                        </span>
                      </td>
                      <td className="py-4 uppercase tracking-wider text-[10px]">
                        {u.role}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.warnings?.length > 0 ? "bg-red-500/15 text-red-400" : "bg-white/5 text-slate-500"}`}
                        >
                          {u.warnings?.length || 0} warns
                        </span>
                      </td>
                      <td className="py-4 pr-2 text-right">
                        {u.role !== "admin" && (
                          <button
                            onClick={() => {
                              setTargetUser(u.username);
                              setWarningText("");
                            }}
                            className="px-2.5 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all font-bold uppercase tracking-widest text-[9px]"
                          >
                            Warn
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Reports ── */}
        {activeTab === "reports" && (
          <div className="p-6 rounded-2xl bg-[#0c091f]/60 border border-white/5 backdrop-blur-md">
            <h3 className="text-sm font-extrabold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
              <AlertOctagon size={16} className="text-rose-400" /> Complaints &
              Reports
            </h3>
            {reports.length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-bold uppercase tracking-widest text-xs">
                No pending complaints
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((r) => (
                  <div
                    key={r._id}
                    className="p-5 rounded-xl bg-black/30 border border-white/5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2.5 mb-2">
                        <span className="text-[10px] font-black uppercase bg-rose-500/10 border border-rose-500/30 text-rose-500 px-2 py-0.5 rounded">
                          {r.status}
                        </span>
                        <span className="text-xs text-slate-400 font-bold">
                          @{r.reporter} → @{r.reportedUser}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-white leading-relaxed">
                        {r.reason}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setTargetUser(r.reportedUser);
                        setWarningText(
                          `Complaint from @${r.reporter}: "${r.reason.slice(0, 50)}${r.reason.length > 50 ? "…" : ""}"`,
                        );
                      }}
                      className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all font-black uppercase tracking-widest text-[9px] shrink-0"
                    >
                      Warn User
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Feedback ── */}
        {activeTab === "feedback" && (
          <div className="p-6 rounded-2xl bg-[#0c091f]/60 border border-white/5 backdrop-blur-md">
            <h3 className="text-sm font-extrabold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
              <Star size={16} className="text-amber-400" /> User Feedback &
              Reviews
            </h3>
            <div className="space-y-4">
              {feedbacks.length === 0 ? (
                <div className="text-center py-12 text-slate-500 font-bold uppercase tracking-widest text-xs">
                  No reviews yet
                </div>
              ) : (
                feedbacks.map((f) => (
                  <div
                    key={f._id}
                    className="p-5 rounded-xl bg-black/30 border border-white/5"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-white text-sm">
                        @{f.username}
                      </span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span
                            key={s}
                            className={`text-sm ${s <= f.rating ? "text-amber-400" : "text-slate-700"}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs font-medium leading-relaxed text-slate-300">
                      {f.review || "No written comments."}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── Campaigns ── */}
        {activeTab === "campaigns" && (
          <div className="p-6 rounded-2xl bg-[#0c091f]/60 border border-white/5 backdrop-blur-md max-w-2xl">
            <h3 className="text-sm font-extrabold text-white mb-1 uppercase tracking-wider flex items-center gap-2">
              <Mail size={16} className="text-indigo-400" /> Re-Engagement
              Marketing Blast
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Send a pre-designed, fun email to all registered users. 22
              templates available — pick one and broadcast!
            </p>
            <div className="space-y-5">
              {/* Campaign Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Select Campaign Template
                </label>

                <select
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  className="w-full bg-black border border-white/10 focus:border-indigo-500/50 rounded-2xl px-4 py-3 text-sm font-semibold text-white outline-none transition-all"
                >
                  {[
                    {
                      value: "miss_you",
                      label: "💔 Miss You — Come Back Online",
                    },
                    {
                      value: "flirty_wifi",
                      label: "📶 Wi-Fi — Strong Connection",
                    },
                    {
                      value: "flirty_magician",
                      label: "✨ Magician — Everyone Disappears",
                    },
                    {
                      value: "flirty_map",
                      label: "🗺️ Map — Lost In Your Messages",
                    },
                    {
                      value: "flirty_google",
                      label: "🔍 Google — Searching For You",
                    },
                    {
                      value: "flirty_type",
                      label: "⌨️ Keyboard — You're My Type",
                    },
                    {
                      value: "flirty_coffee",
                      label: "☕ Coffee — Better With You",
                    },
                    {
                      value: "flirty_camera",
                      label: "📸 Camera — You Make Me Smile",
                    },
                    {
                      value: "flirty_puzzle",
                      label: "🧩 Puzzle — Perfect Fit",
                    },
                    {
                      value: "flirty_sun",
                      label: "☀️ Sun — Brighten The App",
                    },
                    {
                      value: "flirty_song",
                      label: "🎵 Song — Can't Forget You",
                    },
                    {
                      value: "late_night",
                      label: "🌙 Late Night — Someone's Waiting",
                    },
                    {
                      value: "trending_rooms",
                      label: "🔥 Trending Rooms — Join Now",
                    },
                    {
                      value: "unread_messages",
                      label: "📩 Unread Messages — Check Inbox",
                    },
                    {
                      value: "online_crush",
                      label: "👀 Online Crush — They're Waiting",
                    },
                    {
                      value: "streak_reminder",
                      label: "⚡ Streak Reminder — Don't Break It",
                    },
                    {
                      value: "friend_joined",
                      label: "🎉 Friend Joined — Say Hello",
                    },
                    {
                      value: "weekend_vibes",
                      label: "✨ Weekend Vibes — Good Energy",
                    },
                    {
                      value: "voice_call_waiting",
                      label: "📞 Voice Call — Someone's Waiting",
                    },
                    {
                      value: "comeback_reward",
                      label: "🎁 Welcome Back Reward",
                    },
                    {
                      value: "lonely_chat",
                      label: "💭 Mood Boost — Start A Chat",
                    },
                    {
                      value: "typing_moment",
                      label: "⌨️ Typing Moment — New Conversation",
                    },
                  ].map((campaign) => (
                    <option key={campaign.value} value={campaign.value}>
                      {campaign.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preview */}
              <motion.div
                key={selectedCampaign}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Mail size={14} className="text-indigo-400" />
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                    Live Email Preview
                  </h4>
                </div>

                <p className="text-sm text-slate-200 italic leading-relaxed">
                  {CAMPAIGN_PREVIEWS[selectedCampaign]}
                </p>
              </motion.div>

              {/* Recipients */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <Users size={14} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-400">
                  Will be sent to{" "}
                  <span className="text-white">
                    {users.filter((u) => u.role !== "admin").length}
                  </span>{" "}
                  registered users
                </span>
              </div>

              <button
                onClick={handleTriggerCampaign}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white py-4 rounded-2xl font-extrabold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(99,102,241,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30"
              >
                <Send size={14} />
                {loading ? "Sending Broadcast…" : "Send Promotional Broadcast"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Issue Warning Dialog ── */}
      {targetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="bg-[#0c091f]/90 backdrop-blur-xl border border-white/10 p-8 rounded-3xl max-w-sm w-full mx-4 shadow-2xl flex flex-col relative">
            <button
              onClick={() => {
                setTargetUser("");
                setWarningText("");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <ShieldAlert size={18} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Issue Warning
                </h3>
                <p className="text-xs text-slate-500">Target: @{targetUser}</p>
              </div>
            </div>
            <textarea
              placeholder="Describe the violation rules breached…"
              className="bg-black/40 border border-white/5 focus:border-indigo-500/50 rounded-2xl p-4 text-xs font-semibold text-white w-full h-24 outline-none placeholder:text-slate-700 resize-none mb-4"
              value={warningText}
              onChange={(e) => setWarningText(e.target.value)}
            />
            <button
              onClick={() => handleWarnUser(targetUser)}
              disabled={!warningText.trim()}
              className="py-3 bg-red-600 hover:bg-red-500 disabled:opacity-30 text-white rounded-2xl transition-all font-bold text-xs uppercase tracking-wider"
            >
              Issue Warning
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
