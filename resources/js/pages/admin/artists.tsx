import AdminLayout from '@/layouts/admin-layout'
import { Head } from '@inertiajs/react'
import { Music } from 'lucide-react'

export default function Artists() {
	return (
		<AdminLayout>
			<Head title="Artistas - Admin" />

			<div className="bg-white rounded-[2.5rem] p-20 text-center shadow-sm">
				<div className="max-w-md mx-auto space-y-6">

					<h3 className="text-3xl font-bold">Artistas</h3>
					<p className="text-zinc-500 text-lg leading-relaxed">
						Em breve: Gerencie todos os artistas cadastrados, aprove perfis, visualize
						portfólios e muito mais.
					</p>
				</div>
			</div>
		</AdminLayout>
	)
}


