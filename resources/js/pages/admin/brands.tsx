import AdminLayout from '@/layouts/admin-layout'
import { Head } from '@inertiajs/react'
import { Users } from 'lucide-react'

export default function Brands() {
	return (
		<AdminLayout>
			<Head title="Marcas - Admin" />

			<div className="bg-white rounded-[2.5rem] p-20 text-center shadow-sm">
				<div className="max-w-md mx-auto space-y-6">
					<h3 className="text-3xl font-bold">Marcas Parceiras</h3>
					<p className="text-zinc-500 text-lg leading-relaxed">
						Em breve: Gerencie empresas parceiras, contratos e relacionamento com
						marcas.
					</p>
				</div>
			</div>
		</AdminLayout>
	)
}


