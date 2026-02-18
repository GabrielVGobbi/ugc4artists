
import React, { useState } from 'react';
import {
    ArrowLeft, ArrowRight, Clock, Target, Users, Flame,
    Sparkles, CheckCircle2, TrendingUp, MoreHorizontal,
    Layout, Eye, MousePointer2, Share2, Play, Briefcase,
    FileText, MessageSquare, AlertCircle, Zap, Globe,
    ChevronRight, Instagram, Music, ArrowUpRight, Plus, ExternalLink
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip, CartesianGrid } from 'recharts';

interface CampaignDetailsProps {
    campaignId: string | null;
    onBack: () => void;
}

const analyticsData = [
    { name: '01', reach: 1200, eng: 400 },
    { name: '02', reach: 2100, eng: 850 },
    { name: '03', reach: 1800, eng: 600 },
    { name: '04', reach: 3500, eng: 1200 },
    { name: '05', reach: 4200, eng: 1800 },
    { name: '06', reach: 5600, eng: 2400 },
    { name: '07', reach: 6800, eng: 3100 },
];

const PlusIcon = ({ size, className, strokeWidth }: { size: number, className?: string, strokeWidth?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const CampaignDetails: React.FC<CampaignDetailsProps> = ({ campaignId, onBack }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'talents'>('overview');

    const campaign = {
        id: campaignId,
        name: "Summer Vibes 2025",
        brand: "Aura Lifestyle",
        budget: "R$ 15.000,00",
        status: "Live",
        category: "EDITORIAL / MUSIC",
        deadline: "15 Out, 2025",
        image: "https://images.unsplash.com/photo-1526218626217-dc65a29bb444?q=80&w=1200&auto=format&fit=crop",
        totalReach: "125.4k",
        avgEng: "8.4%",
        creatorsCount: 12,
        contentsCount: 24
    };

    const activityLog = [
        { id: 1, action: 'CONTENT_UPLOAD', user: '@alex_rivers', detail: 'Vídeo Final (V3)', time: '14:20', status: 'pending' },
        { id: 2, action: 'BUDGET_UPDATE', user: 'Finance', detail: 'Bônus Performance Liberado', time: '12:05', status: 'success' },
        { id: 3, action: 'NEW_TALENT', user: '@mari.music', detail: 'Contrato Assinado', time: '09:15', status: 'success' },
    ];

    return (
        <div className="flex h-full animate-in fade-in duration-1000">

            {/* LEFT SIDE: FIXED HERO PANEL */}
            <div className="hidden xl:flex w-[450px] flex-col bg-[#0A0A0A] h-full relative overflow-hidden shrink-0 border-r border-white/5">
                <div className="absolute inset-0">
                    <img src={campaign.image} className="w-full h-full object-cover opacity-20 grayscale" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/0 via-[#0A0A0A]/40 to-[#0A0A0A]"></div>
                </div>

                <div className="p-12 relative z-10 flex flex-col h-full justify-between">
                    <button
                        onClick={onBack}
                        className="group flex items-center gap-3 text-white/40 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Campaign Index</span>
                    </button>

                    <div className="space-y-6">
                        <span className="bg-primary text-white text-[9px] font-black uppercase tracking-[0.4em] px-4 py-1.5 rounded-full inline-block">
                            {campaign.category}
                        </span>
                        <h1 className="text-7xl font-black text-white tracking-tighter leading-none italic">
                            {campaign.name.split(' ')[0]} <br />
                            <span className="text-primary">{campaign.name.split(' ')[1]}</span>
                        </h1>
                        <p className="text-white/40 font-medium text-lg italic max-w-xs">"{campaign.brand} defining the next generation of lifestyle sound."</p>
                    </div>

                    <div className="bg-white rounded-[4rem] p-10 border border-zinc-100 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xl font-black tracking-tighter uppercase italic">Mission Log</h4>
                            <div className="px-3 py-1 bg-zinc-50 rounded-lg text-[8px] font-black text-zinc-300">SYNC_LIVE</div>
                        </div>

                        <div className="space-y-6 relative before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-50">
                            {[
                                { user: '@alex_rivers', action: 'Video V3 Approved', time: '14:20', status: 'success' },
                                { user: 'System', action: 'Briefing AI Generated', time: '12:05', status: 'neutral' },
                                { user: '@mari.music', action: 'New Asset Uploaded', time: '09:15', status: 'pending' },
                            ].map((log, i) => (
                                <div key={i} className="relative pl-10">
                                    <div className={`absolute left-0 top-1 w-6 h-6 rounded-lg bg-white border border-zinc-100 shadow-sm flex items-center justify-center ${log.status === 'success' ? 'text-emerald-500' : log.status === 'pending' ? 'text-orange-500' : 'text-zinc-300'}`}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-bold text-[#0A0A0A]"><span className="text-primary">{log.user}</span> {log.action}</p>
                                        <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">{log.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full py-5 border-2 border-dashed border-zinc-100 rounded-[2rem] text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-[#0A0A0A] hover:border-zinc-300 transition-all">Full Audit Log</button>
                    </div>

                </div>

                <div className="pt-12 border-t border-white/10 space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Status</p>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                <p className="text-white font-black text-xs uppercase tracking-widest">{campaign.status}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Launch</p>
                            <p className="text-white font-bold text-xs uppercase tracking-widest">{campaign.deadline}</p>
                        </div>
                    </div>

                    <button className="w-full bg-white text-[#0A0A0A] py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] hover:bg-primary hover:text-white transition-all shadow-2xl flex items-center justify-center gap-3">
                        Edit Briefing <FileText size={16} />
                    </button>
                </div>
            </div>

            {/* RIGHT SIDE: SCROLLABLE WAR ROOM CONTENT */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#FAF9F6]">

                {/* TOP METRIC MARQUEE */}
                <div className="w-full bg-white border-b border-zinc-100 py-4 px-10 overflow-hidden relative">
                    <div className="flex items-center gap-12 whitespace-nowrap animate-[marquee_20s_linear_infinite]">
                        {[
                            { label: 'CPM', val: 'R$ 1.25' },
                            { label: 'ROAS', val: '4.2x' },
                            { label: 'SENTIMENT', val: 'POSITIVE 92%' },
                            { label: 'VIRAL_CORE', val: 'TIKTOK_SOUND' },
                            { label: 'AUTH_SCORE', val: '98/100' },
                        ].map((m, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">{m.label}</span>
                                <span className="text-xs font-black text-[#0A0A0A] tracking-tighter">{m.val}</span>
                                <div className="w-1 h-1 bg-primary rounded-full mx-4"></div>
                            </div>
                        ))}
                        {/* Duplicate for infinite effect */}
                        {[
                            { label: 'CPM', val: 'R$ 1.25' },
                            { label: 'ROAS', val: '4.2x' },
                            { label: 'SENTIMENT', val: 'POSITIVE 92%' },
                            { label: 'VIRAL_CORE', val: 'TIKTOK_SOUND' },
                            { label: 'AUTH_SCORE', val: '98/100' },
                        ].map((m, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">{m.label}</span>
                                <span className="text-xs font-black text-[#0A0A0A] tracking-tighter">{m.val}</span>
                                <div className="w-1 h-1 bg-primary rounded-full mx-4"></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-10 space-y-8 max-w-6xl mx-auto">

                    {/* MAIN STATS HUD */}
                    <div className="grid grid-cols-4 gap-6">
                        {[
                            { label: 'Total Reach', val: campaign.totalReach, trend: '+12%', icon: Eye, color: 'text-orange-500' },
                            { label: 'Avg Engagement', val: campaign.avgEng, trend: '+4.2%', icon: TrendingUp, color: 'text-emerald-500' },
                            { label: 'Talent Match', val: '98%', trend: 'OPTIMIZED', icon: Target, color: 'text-blue-500' },
                            { label: 'ROI Estimated', val: '4.2x', trend: 'HIGH', icon: Zap, color: 'text-purple-500' },
                        ].map((s, i) => (
                            <div key={i} className="bg-white p-8 rounded-[3rem] border border-zinc-100 shadow-sm relative group overflow-hidden">
                                <div className="relative z-10 flex justify-between items-start mb-6">
                                    <div className={`p-3 bg-zinc-50 rounded-2xl ${s.color} group-hover:bg-black group-hover:text-white transition-all`}>
                                        <s.icon size={20} />
                                    </div>
                                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{s.trend}</span>
                                </div>
                                <div className="relative z-10 space-y-1">
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{s.label}</p>
                                    <p className="text-4xl font-black tracking-tighter text-[#0A0A0A]">{s.val}</p>
                                </div>
                                <div className="absolute -bottom-4 -right-4 text-6xl font-black text-black/[0.01] select-none pointer-events-none group-hover:text-black/[0.03] transition-colors italic">0{i + 1}</div>
                            </div>
                        ))}
                    </div>

                    {/* ASYMMETRIC CONTENT GRID */}
                    <div className="grid grid-cols-12 gap-8">

                        {/* CHART PANEL */}
                        <div className="col-span-12 lg:col-span-8 bg-white rounded-[4rem] p-10 border border-zinc-100 shadow-sm relative group overflow-hidden">
                            <div className="flex items-center justify-between mb-12">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black tracking-tighter uppercase italic">Viral Trajectory</h3>
                                    <p className="text-xs font-medium text-zinc-400">Tracking daily reach and creative pulse.</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Reach</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-black rounded-full"></div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Eng</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={analyticsData}>
                                        <defs>
                                            <linearGradient id="pColor" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#FF4D00" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#FF4D00" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fontWeight: 900, fill: '#D1D1D6', letterSpacing: '2px' }}
                                            dy={15}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '24px', border: 'none', shadow: 'none', background: '#0A0A0A', color: '#FFF', padding: '16px' }}
                                            itemStyle={{ fontWeight: 900, fontSize: '14px', color: '#FF4D00' }}
                                            cursor={{ stroke: '#FF4D00', strokeWidth: 2, strokeDasharray: '4 4' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="reach"
                                            stroke="#FF4D00"
                                            strokeWidth={5}
                                            fillOpacity={1}
                                            fill="url(#pColor)"
                                            animationDuration={1500}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="eng"
                                            stroke="#0A0A0A"
                                            strokeWidth={5}
                                            fillOpacity={0}
                                            animationDuration={2000}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* MISSION LOG PANEL */}
                        <div className="col-span-12 lg:col-span-4 bg-white rounded-[4rem] p-10 border border-zinc-100 shadow-sm space-y-10 relative">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xl font-black tracking-tighter uppercase italic">Mission Log</h4>
                                <div className="px-3 py-1 bg-zinc-50 rounded-lg text-[8px] font-black text-zinc-400">LIVE_SYNC</div>
                            </div>

                            <div className="space-y-8 relative before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-50">
                                {activityLog.map((log) => (
                                    <div key={log.id} className="relative pl-10 group cursor-pointer">
                                        <div className={`absolute left-0 top-1 w-6 h-6 rounded-lg bg-white border border-zinc-100 shadow-sm flex items-center justify-center transition-all duration-500 group-hover:scale-125 group-hover:bg-primary group-hover:text-white ${log.status === 'success' ? 'text-emerald-500' : 'text-orange-400'}`}>
                                            {log.status === 'success' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-mono text-zinc-300 font-black uppercase">[{log.action}]</p>
                                            <p className="text-sm font-bold text-[#0A0A0A] leading-tight">
                                                <span className="text-primary">{log.user}</span>: {log.detail}
                                            </p>
                                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{log.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full py-5 border-2 border-dashed border-zinc-100 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black hover:border-zinc-300 transition-all">
                                Full Audit Log <ArrowRight size={14} className="inline ml-2" />
                            </button>
                        </div>

                    </div>

                    {/* TALENT GRID WALL */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-3xl font-black tracking-tighter italic uppercase">Creative Roster <span className="text-primary text-sm not-italic ml-2 opacity-50 font-black">/ 12 ACTIVE</span></h3>
                            <button className="px-6 py-3 bg-[#0A0A0A] text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-primary transition-all">
                                Hire More Talent <Plus size={16} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(t => (
                                <div key={t} className="bg-white p-8 rounded-[3rem] border border-zinc-100 shadow-sm group hover:border-primary/30 transition-all relative overflow-hidden">
                                    <div className="relative mb-6">
                                        <img src={`https://picsum.photos/seed/cr${t}/120/120`} className="w-24 h-24 rounded-[2rem] mx-auto object-cover grayscale group-hover:grayscale-0 transition-all duration-500 ring-4 ring-white shadow-xl" />
                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md border border-zinc-50">
                                            <span className="text-[8px] font-black text-primary uppercase tracking-widest">PHASE: DONE</span>
                                        </div>
                                    </div>
                                    <div className="text-center space-y-1 mb-8">
                                        <h5 className="font-black text-lg tracking-tight leading-none group-hover:text-primary transition-colors">Alex Rivers</h5>
                                        <p className="text-[10px] font-medium text-zinc-400">@alex_rivers</p>
                                    </div>
                                    <div className="pt-6 border-t border-zinc-50 flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <p className="text-[8px] font-black text-zinc-300 uppercase tracking-widest">Impact</p>
                                            <p className="text-sm font-black tracking-tighter">98.2k</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-300 group-hover:bg-primary group-hover:text-white transition-all cursor-pointer">
                                            <ExternalLink size={14} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
        </div >
    );
};

export default CampaignDetails;

