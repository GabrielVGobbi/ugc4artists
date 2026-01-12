import AdminLayout from '@/layouts/admin-layout'
import { Head } from '@inertiajs/react'
import { FileText } from 'lucide-react'

export default function Proposals() {
	return (
		<AdminLayout>
			<Head title="Propostas - Admin" />

			<div className="bg-white rounded-[2.5rem] p-20 text-center shadow-sm">
				<div className="max-w-md mx-auto space-y-6">
					<div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
						<FileText size={40} className="text-amber-600" />
					</div>
					<h3 className="text-3xl font-bold">Gestão de Propostas</h3>
					<p className="text-zinc-500 text-lg leading-relaxed">
						Em breve: Aprove, rejeite e negocie propostas entre artistas e marcas.
					</p>
				</div>
			</div>
		</AdminLayout>
	)
}


