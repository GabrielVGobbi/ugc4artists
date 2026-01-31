import AdminLayout from '@/layouts/app-layout'
import { Button } from '@headlessui/react'
import { Head } from '@inertiajs/react'
import { Music, Search } from 'lucide-react'

export default function Artists() {
    return (
        <AdminLayout>
            <Head title="Artistas - Admin" />

                <div className="">
                    {/* Header Actions */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-zinc-500 text-sm font-medium">

                            </p>
                        </div>

                    </div>

                    {/* Coming Soon Card */}
                    <div className="bg-white rounded-[2.5rem] p-20 text-center shadow-sm">
                        <div className="space-y-6 w-full">
                            <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mx-auto">
                                <Search size={40} className="text-zinc-400" />
                            </div>
                            <h3 className="text-3xl font-bold">Em Desenvolvimento</h3>
                            <p className="text-zinc-500 text-lg leading-relaxed">
                                Em breve: Gerencie todos os artistas cadastrados, aprove perfis, visualize
                                portfólios e muito mais.

                            </p>

                        </div>
                    </div>
                </div>

        </AdminLayout>
    )
}




