
import React, { useState } from 'react';
import {
    ArrowLeft, ArrowRight, Clock, Target, Users, Flame,
    Sparkles, CheckCircle2, TrendingUp, MoreHorizontal,
    Layout, Eye, MousePointer2, Share2, Play, Briefcase,
    FileText, MessageSquare, AlertCircle, Zap, Globe,
    ChevronRight, Instagram, Music, ArrowUpRight, Plus,
    ExternalLink, Maximize2, Filter, BarChart3, Layers
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip, CartesianGrid, YAxis } from 'recharts';

interface CampaignDetailsProps {
    campaignId: string | null;
    onBack: () => void;
}

const analyticsData = [
    { name: 'Seg', reach: 12000, eng: 4.2 },
    { name: 'Ter', reach: 21000, eng: 5.8 },
    { name: 'Qua', reach: 18000, eng: 4.5 },
    { name: 'Qui', reach: 35000, eng: 7.2 },
    { name: 'Sex', reach: 42000, eng: 8.1 },
    { name: 'Sab', reach: 56000, eng: 8.4 },
    { name: 'Dom', reach: 68000, eng: 9.2 },
];

const CampaignDetails: React.FC<CampaignDetailsProps> = ({ campaignId, onBack }) => {
    const [activeTab, setActiveTab] = useState<'creative' | 'performance' | 'roster'>('creative');

    const campaign = {
        name: "Summer Vibes 2025",
        brand: "AURA LIFESTYLE",
        status: "LIVE_PRODUCTION",
        phase: 3, // 1: Briefing, 2: Match, 3: Production, 4: Results
        mainStats: {
            reach: "125.4k",
            roi: "4.8x",
            creators: 12,
            pending: 3
        }
    };

    const creativeAssets = [
        { id: 1, type: 'video', url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=400', creator: '@alex_rivers', status: 'Approved', size: 'large' },
        { id: 2, type: 'video', url: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=400', creator: '@mari.music', status: 'Reviewing', size: 'small' },
        { id: 3, type: 'video', url: 'https://images.unsplash.com/photo-1526218626217-dc65a29bb444?q=80&w=400', creator: '@biasom_', status: 'Approved', size: 'small' },
        { id: 4, type: 'video', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400', creator: '@juniorbeat', status: 'Recording', size: 'medium' },
    ];

    const talentRoster = [
        { id: 1, name: 'Alex Rivers', handle: '@alex_rivers', status: 'Approved', progress: 100, img: 'https://picsum.photos/seed/p1/80/80' },
        { id: 2, name: 'Bia Som', handle: '@biasom_oficial', status: 'Shooting', progress: 65, img: 'https://picsum.photos/seed/p2/80/80' },
        { id: 3, name: 'Junior Beat', handle: '@juniorbeat', status: 'Drafting', progress: 30, img: 'https://picsum.photos/seed/p3/80/80' },
    ];

    return (
        <div className="max-w-[300px] mx-auto pb-32 animate-in fade-in duration-700">

            {/* --- TOP HUD: LIFECYCLE TRACKER --- */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-12 bg-white p-8 rounded-[3rem] border border-zinc-100 shadow-sm">
                <div className="flex items-center gap-6">
                    <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400 hover:bg-[#0A0A0A] hover:text-white transition-all">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{campaign.brand}</p>
                        <h2 className="text-3xl font-black tracking-tighter italic">{campaign.name}</h2>
                    </div>
                </div>

                {/* Phase Tracker */}
                <div className="flex items-center gap-4 bg-zinc-50 p-2 rounded-2xl border border-zinc-100">
                    {['BRIEFING', 'MATCH', 'PRODUCTION', 'INSIGHTS'].map((step, i) => (
                        <div key={step} className="flex items-center gap-2">
                            <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${campaign.phase === i + 1 ? 'bg-primary text-white shadow-lg shadow-orange-500/20' : i + 1 < campaign.phase ? 'text-emerald-500' : 'text-zinc-300'}`}>
                                {i + 1 < campaign.phase ? <CheckCircle2 size={12} className="inline mr-1" /> : null}
                                {step}
                            </div>
                            {i < 3 && <div className="w-4 h-[1px] bg-zinc-200"></div>}
                        </div>
                    ))}
                </div>

                <div className="flex gap-3">
                    <button className="bg-[#0A0A0A] text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-primary transition-all">Export Report</button>
                    <button className="bg-primary text-white p-3 rounded-xl shadow-lg shadow-orange-500/20"><Plus size={20} /></button>
                </div>
            </div>

            {/* --- MAIN GRID --- */}
            <div className="grid grid-cols-12 gap-8">

                {/* LEFT: CONTENT & ANALYSIS (8/12) */}
                <div className="col-span-12 xl:col-span-8 space-y-8">

                    {/* NAVIGATION TABS */}
                    <div className="flex gap-8 border-b border-zinc-100 pb-4">
                        {[
                            { id: 'creative', label: 'Creative Wall', icon: Layers },
                            { id: 'performance', label: 'Viral Pulse', icon: BarChart3 },
                            { id: 'roster', label: 'Talent Roster', icon: Users },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab.id ? 'text-[#0A0A0A]' : 'text-zinc-400 hover:text-zinc-600'}`}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                                {activeTab === tab.id && <div className="absolute -bottom-5 left-0 right-0 h-1 bg-primary rounded-full"></div>}
                            </button>
                        ))}
                    </div>

                    {/* DYNAMIC CONTENT AREA */}
                    <div className="min-h-[600px]">

                        {activeTab === 'creative' && (
                            <div className="grid grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {creativeAssets.map((asset, i) => (
                                    <div
                                        key={asset.id}
                                        className={`relative rounded-[3rem] overflow-hidden group border border-zinc-100 shadow-sm ${asset.size === 'large' ? 'col-span-12 lg:col-span-8 aspect-video' :
                                                asset.size === 'medium' ? 'col-span-12 lg:col-span-6 aspect-square' :
                                                    'col-span-12 lg:col-span-4 aspect-[4/5]'
                                            }`}
                                    >
                                        <img src={asset.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                        <div className="absolute top-6 left-6 right-6 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                            <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg text-white text-[9px] font-black uppercase tracking-widest">{asset.creator}</span>
                                            <div className="flex gap-2">
                                                <button className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#0A0A0A] hover:bg-primary hover:text-white transition-colors"><Maximize2 size={14} /></button>
                                                <button className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#0A0A0A] hover:bg-emerald-500 hover:text-white transition-colors"><CheckCircle2 size={14} /></button>
                                            </div>
                                        </div>

                                        <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-white/60 uppercase tracking-widest">Status</p>
                                                <p className="text-white font-bold text-lg italic tracking-tight">{asset.status}</p>
                                            </div>
                                            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-xl">
                                                <Play size={20} fill="currentColor" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'performance' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-white p-12 rounded-[4rem] border border-zinc-100 shadow-sm relative overflow-hidden">
                                    <div className="flex justify-between items-end mb-12">
                                        <div className="space-y-1">
                                            <h4 className="text-3xl font-black tracking-tighter uppercase italic">Viral Pulse</h4>
                                            <p className="text-xs font-medium text-zinc-400">Correlation between reach and engagement frequency.</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-4xl font-black tracking-tighter text-primary">+125.4k</p>
                                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">Total Impressions</p>
                                        </div>
                                    </div>

                                    <div className="h-[400px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={analyticsData}>
                                                <defs>
                                                    <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#FF4D00" stopOpacity={0.15} />
                                                        <stop offset="95%" stopColor="#FF4D00" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F8F8F8" />
                                                <XAxis
                                                    dataKey="name"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 10, fontWeight: 900, fill: '#D1D1D6', letterSpacing: '1px' }}
                                                    dy={15}
                                                />
                                                <YAxis hide />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '24px', border: 'none', background: '#0A0A0A', color: '#FFF', padding: '16px' }}
                                                    itemStyle={{ fontWeight: 900, fontSize: '14px', color: '#FF4D00' }}
                                                    cursor={{ stroke: '#FF4D00', strokeWidth: 2, strokeDasharray: '4 4' }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="reach"
                                                    stroke="#FF4D00"
                                                    strokeWidth={5}
                                                    fillOpacity={1}
                                                    fill="url(#colorReach)"
                                                    animationDuration={1500}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Hot Hook</p>
                                            <h5 className="text-xl font-bold tracking-tight">"O segredo do meu som..."</h5>
                                        </div>
                                        <div className="w-12 h-12 bg-orange-50 text-primary rounded-2xl flex items-center justify-center">
                                            <Flame size={20} />
                                        </div>
                                    </div>
                                    <div className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Top Audience</p>
                                            <h5 className="text-xl font-bold tracking-tight">São Paulo, BR (42%)</h5>
                                        </div>
                                        <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                                            <Globe size={20} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'roster' && (
                            <div className="bg-white rounded-[4rem] border border-zinc-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-zinc-50 border-b border-zinc-100">
                                            <th className="px-10 py-6 text-[9px] font-black uppercase tracking-widest text-zinc-400">Creator</th>
                                            <th className="px-10 py-6 text-[9px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                                            <th className="px-10 py-6 text-[9px] font-black uppercase tracking-widest text-zinc-400">Workflow</th>
                                            <th className="px-10 py-6 text-[9px] font-black uppercase tracking-widest text-zinc-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-50">
                                        {talentRoster.map(talent => (
                                            <tr key={talent.id} className="group hover:bg-[#FAF9F6] transition-colors">
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <img src={talent.img} className="w-12 h-12 rounded-2xl object-cover" />
                                                        <div className="space-y-0.5">
                                                            <p className="font-bold text-sm tracking-tight">{talent.name}</p>
                                                            <p className="text-[10px] text-zinc-400 font-medium">{talent.handle}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${talent.status === 'Approved' ? 'bg-emerald-50 text-emerald-500' : 'bg-orange-50 text-orange-500'}`}>
                                                        {talent.status}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <div className="w-32 space-y-2">
                                                        <div className="flex justify-between text-[8px] font-black text-zinc-300 uppercase">
                                                            <span>Progress</span>
                                                            <span>{talent.progress}%</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-[#0A0A0A] group-hover:bg-primary transition-all" style={{ width: `${talent.progress}%` }}></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <button className="text-zinc-300 hover:text-[#0A0A0A] transition-colors"><MessageSquare size={18} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                    </div>
                </div>

                {/* RIGHT: HUD & ACTIVITY (4/12) */}
                <div className="col-span-12 xl:col-span-4 space-y-8">

                    {/* QUICK STATS HUD */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#0A0A0A] p-8 rounded-[3rem] text-white space-y-4 shadow-xl">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Performance</p>
                            <div className="space-y-1">
                                <p className="text-4xl font-black tracking-tighter">4.8x</p>
                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">ROI Est. <TrendingUp size={10} /></p>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-[3rem] border border-zinc-100 shadow-sm space-y-4">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Pending Task</p>
                            <div className="space-y-1">
                                <p className="text-4xl font-black tracking-tighter">03</p>
                                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Approvals</p>
                            </div>
                        </div>
                    </div>

                    {/* AI STRATEGY BRIEF */}
                    <div className="bg-primary p-10 rounded-[4rem] text-white relative overflow-hidden group">
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <Sparkles size={24} className="animate-pulse" />
                                <h4 className="text-xl font-black tracking-tighter uppercase italic">Creative DNA</h4>
                            </div>
                            <p className="text-sm font-medium leading-relaxed opacity-90">
                                Sua marca está ressoando com produtores musicais independentes. O hook de 5s focado no beatmaking é o mais compartilhado.
                            </p>
                            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:translate-x-2 transition-transform">
                                View Full Strategy <ArrowRight size={14} />
                            </button>
                        </div>
                        <div className="absolute -right-8 -bottom-8 text-[12rem] font-black text-white/[0.05] pointer-events-none select-none italic rotate-[-15deg]">IA</div>
                    </div>

                    {/* MISSION LOG */}
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
            </div>
        </div>
    );
};

export default CampaignDetails;
