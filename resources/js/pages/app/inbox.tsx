import AdminLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { MessageSquare } from 'lucide-react'

export default function Inbox() {
	return (
		<AdminLayout>
			<Head title="Mensagens - Admin" />

			<div className="bg-white rounded-[2.5rem] p-20 text-center shadow-sm">
				<div className="max-w-md mx-auto space-y-6">
					<div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
						<MessageSquare size={40} className="text-indigo-600" />
					</div>
					<h3 className="text-3xl font-bold">Mensagens</h3>
					<p className="text-zinc-500 text-lg leading-relaxed">
						Em breve: Sistema completo de mensagens entre admin, artistas e marcas.
					</p>
				</div>
			</div>
		</AdminLayout>
	)
}




