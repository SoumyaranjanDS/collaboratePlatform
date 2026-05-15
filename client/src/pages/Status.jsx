import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DarkVeil from '../components/DarkVeil';
import { ArrowLeft, Activity, Globe, Shield, Terminal, Zap, Cpu, Server, Wifi } from 'lucide-react';

const Status = () => {
  const navigate = useNavigate();
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setUptime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const nodes = [
    { name: "Global Mesh Hub", status: "Operational", latency: "24ms", region: "US-East-1", type: "Core" },
    { name: "V8 Compiler Shard", status: "Operational", latency: "42ms", region: "EU-West-2", type: "Compute" },
    { name: "Visualizer Socket", status: "Operational", latency: "31ms", region: "AP-South-1", type: "Sync" },
    { name: "Encryption Gateway", status: "Operational", latency: "12ms", region: "Global", type: "Security" },
    { name: "Legacy Database Node", status: "Under Maintenance", latency: "—", region: "US-West-2", type: "Storage" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen bg-[#050505] text-[#a1a1aa] font-sans selection:bg-blue-500/30 relative overflow-x-hidden"
    >
      
      {/* BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-20 brightness-50 grayscale">
          <DarkVeil hueShift={0} speed={0.1} />
        </div>
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl">
        <div className="backdrop-blur-xl border border-white/10 bg-[#050505]/60 rounded-full px-6 py-3 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <img src="/logo.png" alt="logo" className="w-7 h-7 object-contain rounded-full border border-white/10 group-hover:scale-110 transition-transform" />
            <span className="text-white text-[10px] font-bold tracking-[0.3em] uppercase">Status Protocol</span>
          </div>
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[9px] font-bold tracking-widest uppercase text-white/40 hover:text-white transition-all hover:scale-105 active:scale-95">
            <ArrowLeft size={14} /> Back to Home
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-16">
            <div>
              <div className="flex items-center gap-3 text-green-500 mb-4 text-[10px] font-bold tracking-[0.4em] uppercase">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                All Systems Operational
              </div>
              <h1 className="text-4xl md:text-6xl text-white tracking-tighter">Network Integrity</h1>
            </div>
            
            <div className="bg-white/[0.03] border border-white/5 p-6 rounded-sm min-w-[200px]">
              <span className="text-[10px] font-bold tracking-widest uppercase opacity-30 block mb-2">Current Uptime</span>
              <span className="text-2xl text-white font-mono">{formatTime(uptime + 864000)}</span>
            </div>
          </div>

          {/* METRICS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            {[
              { label: "Global Latency", value: "32ms", icon: <Wifi size={16} /> },
              { label: "Mesh Load", value: "14.2%", icon: <Activity size={16} /> },
              { label: "Active Shards", value: "2,408", icon: <Server size={16} /> },
              { label: "Success Rate", value: "99.99%", icon: <Zap size={16} /> }
            ].map((metric, i) => (
              <div key={i} className="p-6 border border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-3 text-blue-500 mb-4 opacity-50">
                  {metric.icon}
                  <span className="text-[10px] font-bold tracking-widest uppercase">{metric.label}</span>
                </div>
                <div className="text-2xl text-white font-medium tracking-tight">{metric.value}</div>
              </div>
            ))}
          </div>

          {/* NODES TABLE */}
          <div className="border border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.03]">
                    <th className="p-6 text-[10px] font-bold tracking-widest uppercase opacity-40">System Node</th>
                    <th className="p-6 text-[10px] font-bold tracking-widest uppercase opacity-40">Classification</th>
                    <th className="p-6 text-[10px] font-bold tracking-widest uppercase opacity-40">Region</th>
                    <th className="p-6 text-[10px] font-bold tracking-widest uppercase opacity-40">Latency</th>
                    <th className="p-6 text-[10px] font-bold tracking-widest uppercase opacity-40 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {nodes.map((node, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                      <td className="p-6 text-white font-medium text-sm flex items-center gap-3">
                        {node.type === 'Core' && <Globe size={14} className="text-blue-500" />}
                        {node.type === 'Compute' && <Terminal size={14} className="text-blue-500" />}
                        {node.type === 'Sync' && <Activity size={14} className="text-blue-500" />}
                        {node.type === 'Security' && <Shield size={14} className="text-blue-500" />}
                        {node.type === 'Storage' && <Server size={14} className="text-blue-500" />}
                        {node.name}
                      </td>
                      <td className="p-6 text-[10px] font-bold tracking-widest uppercase opacity-30">{node.type}</td>
                      <td className="p-6 text-xs font-mono opacity-40">{node.region}</td>
                      <td className="p-6 text-xs font-mono opacity-40">{node.latency}</td>
                      <td className="p-6 text-right">
                        <span className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full ${node.status === 'Operational' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                          {node.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-20 p-8 border border-blue-500/10 bg-blue-500/[0.02] flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <Cpu className="text-blue-500" size={32} />
              <div>
                <h4 className="text-white font-medium mb-1">Real-time Performance Metrics</h4>
                <p className="text-xs opacity-40">System health is verified every 60 seconds across the Global Mesh.</p>
              </div>
            </div>
            <button className="px-8 py-3 bg-white text-black text-[10px] font-bold tracking-widest uppercase rounded-sm hover:bg-blue-50 transition-colors">
              Download Full Report
            </button>
          </div>

        </motion.div>
      </main>

      <footer className="relative z-10 py-16 border-t border-white/5 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-[10px] font-bold tracking-[0.3em] uppercase">
            <p className="opacity-20">&copy; {new Date().getFullYear()} Chatify Laboratory. Network v2.0</p>
            <p>
              <span className="opacity-20 lowercase italic font-normal tracking-normal mr-2">developed by</span>
              <a 
                href="https://soumya.site" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-blue-500 transition-colors"
              >
                soumya
              </a>
            </p>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

export default Status;
