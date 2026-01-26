import AdminLayout from '@/layouts/app-layout'
import { Button } from '@headlessui/react'
import { Head } from '@inertiajs/react'
import { Plus, Search, Filter } from 'lucide-react'

export default function Campaigns() {
	return (
		<AdminLayout>
			<Head title="Campanhas - Admin" />

			<div className="space-y-8">
				{/* Header Actions */}
				<div className="flex items-center justify-between">
					<div>
						<p className="text-zinc-500 text-sm font-medium">

						</p>
					</div>
					<Button className="px-6 py-3 bg-primary text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-[#FF6A33] transition-all shadow-lg shadow-primary/20">
						<Plus size={20} />
						Nova Campanha
					</Button>
				</div>

				{/* Coming Soon Card */}
				<div className="bg-white rounded-[2.5rem] p-20 text-center shadow-sm">
					<div className="max-w-md mx-auto space-y-6">
						<div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mx-auto">
							<Search size={40} className="text-zinc-400" />
						</div>
						<h3 className="text-3xl font-bold">Em Desenvolvimento</h3>
						<p className="text-zinc-500 text-lg leading-relaxed">
							A gestão completa de campanhas está sendo desenvolvida. Em breve você
							poderá criar, editar e monitorar todas as suas campanhas aqui.
						</p>

					</div>
				</div>
			</div>
		</AdminLayout>
	)
}




