import AdminLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { Zap, Sparkles, ArrowRight } from 'lucide-react'

export default function Studio() {
	return (
		<AdminLayout>
			<Head title="Studio AI - Admin" />

			<div className="space-y-8">
				{/* Hero Card */}
				<div className="bg-gradient-to-br from-[#FF4D00] to-[#FF6A33] rounded-[2.5rem] p-16 text-white shadow-2xl relative overflow-hidden">
					<div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
					<div className="relative z-10 max-w-2xl">
						<div className="flex items-center gap-3 mb-6">
							<div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
								<Zap size={24} />
							</div>
							<span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
								Powered by AI
							</span>
						</div>
						<h2 className="text-5xl font-bold mb-4">Studio AI</h2>
						<p className="text-xl text-white/90 leading-relaxed mb-8">
							Crie campanhas inteligentes usando o poder da inteligência artificial.
							Encontre os artistas perfeitos, gere briefings completos e otimize suas
							estratégias automaticamente.
						</p>
						<button className="px-8 py-4 bg-white text-[#FF4D00] rounded-2xl font-bold flex items-center gap-3 hover:bg-zinc-100 transition-all shadow-xl">
							Começar Agora
							<ArrowRight size={20} />
						</button>
					</div>
				</div>

				{/* Features Grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-lg transition-all group">
						<div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
							<Sparkles size={28} className="text-purple-600" />
						</div>
						<h3 className="text-xl font-bold mb-3">Gerador de Briefings</h3>
						<p className="text-zinc-500 leading-relaxed">
							Crie briefings completos e profissionais em segundos usando IA.
						</p>
					</div>

					<div className="bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-lg transition-all group">
						<div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
							<Zap size={28} className="text-blue-600" />
						</div>
						<h3 className="text-xl font-bold mb-3">Match Inteligente</h3>
						<p className="text-zinc-500 leading-relaxed">
							Encontre os artistas perfeitos baseado em preferências e histórico.
						</p>
					</div>

					<div className="bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-lg transition-all group">
						<div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
							<Sparkles size={28} className="text-emerald-600" />
						</div>
						<h3 className="text-xl font-bold mb-3">Análise Preditiva</h3>
						<p className="text-zinc-500 leading-relaxed">
							Preveja o sucesso de campanhas com análise de dados históricos.
						</p>
					</div>
				</div>

				{/* Coming Soon */}
				<div className="bg-zinc-100 border-2 border-zinc-200 rounded-[2.5rem] p-16 text-center">
					<p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-3">
						Coming Soon
					</p>
					<h3 className="text-3xl font-bold mb-4">Em Desenvolvimento</h3>
					<p className="text-zinc-600 text-lg max-w-2xl mx-auto">
						Nossa equipe está trabalhando para trazer o poder da IA para sua gestão de
						campanhas. Em breve disponível!
					</p>
				</div>
			</div>
		</AdminLayout>
	)
}




