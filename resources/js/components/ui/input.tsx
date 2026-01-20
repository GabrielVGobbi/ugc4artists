// input.tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
    [
        "",
    ].join(" "),
    {
        variants: {
            variant: {
                default: "",
                filled: "",
                ghost: "",
                underline:
                    "",
            },
            size: {
                sm: "",
                default: "",
                lg: "",
                none: "",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

type InputProps = React.ComponentProps<"input"> &
    VariantProps<typeof inputVariants>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, variant, size, ...props }, ref) => {
        return (
            <input
                ref={ref}
                type={type}
                data-slot="input"
                className={cn(inputVariants({ variant, size, className }))}
                {...props}
            />
        )
    }
)

Input.displayName = "Input"

export { Input, inputVariants }
