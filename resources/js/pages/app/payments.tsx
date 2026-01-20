import AdminLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { DollarSign } from 'lucide-react'

export default function Payments() {
	return (
		<AdminLayout>
			<Head title="Pagamentos - Admin" />

			<div className="bg-white rounded-[2.5rem] p-20 text-center shadow-sm">
				<div className="max-w-md mx-auto space-y-6">
					<div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
						<DollarSign size={40} className="text-emerald-600" />
					</div>
					<h3 className="text-3xl font-bold">Gestão Financeira</h3>
					<p className="text-zinc-500 text-lg leading-relaxed">
						Em breve: Gerencie carteiras, transações, comissões e relatórios
						financeiros.
					</p>
				</div>
			</div>
		</AdminLayout>
	)
}




