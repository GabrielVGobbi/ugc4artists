import HeadingSmall from '@/components/heading-small'
import InputError from '@/components/input-error'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useForm } from '@inertiajs/react'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null)
    const [isOpen, setIsOpen] = useState(false)

    const { data, setData, delete: destroy, processing, errors, reset } = useForm({
        password: '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        destroy('/app/settings/profile', {
            preserveScroll: true,
            onError: () => passwordInput.current?.focus(),
        })
    }

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (!open) {
            reset()
        }
    }

    return (
        <div className="space-y-6 hidden">
            <Separator />

            <HeadingSmall
                title="Excluir Conta"
                description="Exclua sua conta e todos os seus dados permanentemente"
            />

            <div className="space-y-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                        <AlertTriangle size={20} />
                    </div>
                    <div className="space-y-1">
                        <p className="font-bold text-destructive">Atenção</p>
                        <p className="text-sm text-destructive/80">
                            Esta ação é irreversível. Todos os seus dados serão
                            excluídos permanentemente.
                        </p>
                    </div>
                </div>

                <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                        <Button
                            variant="destructive"
                            className="rounded-xl"
                            data-test="delete-user-button"
                        >
                            <Trash2 size={16} />
                            Excluir minha conta
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-2xl">
                        <DialogTitle>
                            Tem certeza que deseja excluir sua conta?
                        </DialogTitle>
                        <DialogDescription>
                            Após a exclusão, todos os seus recursos e dados
                            serão permanentemente removidos. Digite sua senha
                            para confirmar.
                        </DialogDescription>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="sr-only">
                                    Senha
                                </Label>

                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    placeholder="Digite sua senha"
                                    autoComplete="current-password"
                                    className="rounded-xl"
                                />

                                <InputError message={errors.password} />
                            </div>

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button
                                        variant="secondary"
                                        className="rounded-xl"
                                        type="button"
                                    >
                                        Cancelar
                                    </Button>
                                </DialogClose>

                                <Button
                                    variant="destructive"
                                    disabled={processing}
                                    className="rounded-xl"
                                    type="submit"
                                    data-test="confirm-delete-user-button"
                                >
                                    <Trash2 size={16} />
                                    Confirmar exclusão
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
