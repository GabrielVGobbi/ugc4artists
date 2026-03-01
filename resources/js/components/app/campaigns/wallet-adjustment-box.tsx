import React from 'react'
import { Wallet, Minus, Plus, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, formatCurrency } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

interface WalletAdjustmentBoxProps {
    balance: number
    amountToUse: number
    grandTotal: number
    useWallet: boolean
    onToggle: (checked: boolean) => void
    onAmountChange: (amount: number) => void
}

export function WalletAdjustmentBox({
    balance,
    amountToUse,
    grandTotal,
    useWallet,
    onToggle,
    onAmountChange,
}: WalletAdjustmentBoxProps) {
    const maxPossible = Math.min(balance, grandTotal)

    const handleIncrement = () => {
        onAmountChange(Math.min(maxPossible, amountToUse + 10))
    }

    const handleDecrement = () => {
        onAmountChange(Math.max(0, amountToUse - 10))
    }

    const handleQuickAction = (value: number) => {
        onAmountChange(Math.min(maxPossible, value))
    }

    const handleUseAll = () => {
        onAmountChange(maxPossible)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '')
        const num = val === '' ? 0 : parseInt(val)
        onAmountChange(Math.min(maxPossible, num))
    }

    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-[2.5rem] border transition-all duration-500',
                useWallet
                    ? 'border-emerald-200 bg-white shadow-xl shadow-emerald-500/10'
                    : 'border-zinc-100 bg-zinc-50/50 shadow-sm'
            )}
        >
            <div className="p-8">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div
                            className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-[1.25rem] transition-all duration-500',
                                useWallet
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                    : 'bg-zinc-200 text-zinc-500'
                            )}
                        >
                            <Wallet size={15} />
                        </div>
                        <div>
                            <p
                                className={cn(
                                    'text-lg font-black tracking-tight transition-colors duration-500',
                                    useWallet ? 'text-secondary' : 'text-zinc-500'
                                )}
                            >
                                Saldo da Carteira
                            </p>

                        </div>
                    </div>

                    <Switch
                        checked={useWallet}
                        onCheckedChange={onToggle}
                        className="data-[state=checked]:bg-emerald-500 scale-125"
                    />
                </div>

                <AnimatePresence>
                    {useWallet && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            className="overflow-hidden"
                        >
                            <div className="space-y-8 hidden">
                                {/* Large Input Display */}
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                                        <span className="text-2xl font-black text-emerald-500/50">R$</span>
                                    </div>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={amountToUse || ''}
                                        onChange={handleInputChange}
                                        placeholder="0"
                                        className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-3xl py-2 pl-16 pr-32 text-2xl font-black text-secondary outline-none transition-all focus:border-emerald-500 focus:bg-white focus:shadow-2xl focus:shadow-emerald-500/10"
                                    />
                                    <div className="absolute inset-y-2 right-2 flex items-center gap-2">
                                        <Button
                                        size={'sm'}
                                            type="button"
                                            onClick={handleUseAll}
                                            className="rounded-2xl bg-emerald-500 text-white font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
                                        >
                                            <Wallet size={14} />
                                            Usar Tudo
                                        </Button>
                                    </div>
                                </div>

                                {/* Quick Adjustment Buttons */}
                                <div className="hidden space-y-4">
                                    <p className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">
                                        Acesso Rápido
                                    </p>
                                    <div className="grid grid-cols-4 gap-3">
                                        {[10, 20, 50, 100].map((val) => (
                                            <button
                                                key={val}
                                                type="button"
                                                onClick={() => handleQuickAction(val)}
                                                className="py-4 rounded-2xl border-2 border-zinc-100 font-black text-zinc-600 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all active:scale-95"
                                            >
                                                +{val}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Precision Controls */}
                                <div className="flex items-center justify-between p-2 bg-zinc-50 rounded-[2rem] border border-zinc-100">
                                    <button
                                        type="button"
                                        onClick={handleDecrement}
                                        className="cursor-pointer w-8 h-8 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm active:scale-90"
                                    >
                                        <Minus size={20} />
                                    </button>
                                    <div className="text-center">
                                        <span className="text-SM font-black text-secondary">
                                            {formatCurrency(amountToUse)}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleIncrement}
                                        className="cursor-pointer w-8 h-8 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm active:scale-90"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Visual Decor */}
            <div className={cn(
                "absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl transition-opacity duration-500",
                useWallet ? "opacity-100" : "opacity-0"
            )} />
        </div>
    )
}
