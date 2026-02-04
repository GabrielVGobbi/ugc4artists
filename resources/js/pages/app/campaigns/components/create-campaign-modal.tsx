import { useState } from 'react'
import { router } from '@inertiajs/react'
import { Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CustomField } from '@/components/ui/custom-field'
import { useCampaignMutations } from '@/hooks/use-campaigns'

interface CreateCampaignModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateCampaignModal({ open, onOpenChange }: CreateCampaignModalProps) {
    const [name, setName] = useState('')
    const [error, setError] = useState<string | null>(null)

    const { createDraftCampaign, isCreatingDraft } = useCampaignMutations()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!name.trim()) {
            setError('Digite um nome para a campanha')
            return
        }

        if (name.trim().length < 3) {
            setError('O nome deve ter pelo menos 3 caracteres')
            return
        }

        try {
            const result = await createDraftCampaign(name.trim())

            toast.success('Rascunho criado! Agora complete os detalhes.')

            // Redirect to edit page
            onOpenChange(false)
            setName('')
            router.visit(`/app/campaigns/${result.campaign.uuid}/edit`)
        } catch (err) {
            setError('Erro ao criar campanha. Tente novamente.')
        }
    }

    const handleClose = () => {
        if (!isCreatingDraft) {
            onOpenChange(false)
            setName('')
            setError(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div>
                            <DialogTitle className="text-2xl font-black tracking-tight">
                                Nova Campanha
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                Dê um nome para começar
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <CustomField
                        label="Nome da Campanha"
                        placeholder="Ex: Lançamento Verão 2026"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value)
                            setError(null)
                        }}
                        error={error ?? undefined}
                        autoFocus
                    />

                    <p className="text-xs text-muted-foreground">
                        Você poderá editar todos os detalhes na próxima etapa.
                        Suas alterações serão salvas automaticamente.
                    </p>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isCreatingDraft}
                            className="flex-1 rounded-xl py-5 h-auto font-bold"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isCreatingDraft || !name.trim()}
                            className="flex-1 rounded-xl py-5 h-auto font-bold bg-primary hover:bg-primary/90"
                        >
                            {isCreatingDraft ? (
                                <>
                                    <Loader2 size={18} className="animate-spin mr-2" />
                                    Criando...
                                </>
                            ) : (
                                <>
                                    Criar Campanha
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
