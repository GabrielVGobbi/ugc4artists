import { cn } from '@/lib/utils'
import { FieldRenderer } from './form-fields'
import type { StepConfig, SectionConfig, FieldConfig, CampaignFormData } from '../lib/form-config'

interface FormStepProps {
    step: StepConfig
    formData: CampaignFormData
    errors: Partial<Record<keyof CampaignFormData, string>>
    onFieldChange: <K extends keyof CampaignFormData>(key: K, value: CampaignFormData[K]) => void
    isFieldVisible: (field: FieldConfig) => boolean
}

export function FormStep({
    step,
    formData,
    errors,
    onFieldChange,
    isFieldVisible,
}: FormStepProps) {
    return (
        <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
            {/* Step Header */}
            <div className="space-y-2">
                <h3 className="text-4xl font-bold tracking-tighter text-foreground">
                    {step.title}
                </h3>
                <p className="text-muted-foreground text-sm font-medium">
                    {step.description}
                </p>
            </div>

            {/* Sections */}
            <div className="space-y-10">
                {step.sections.map((section) => (
                    <FormSection
                        key={section.id}
                        section={section}
                        formData={formData}
                        errors={errors}
                        onFieldChange={onFieldChange}
                        isFieldVisible={isFieldVisible}
                    />
                ))}
            </div>
        </div>
    )
}

interface FormSectionProps {
    section: SectionConfig
    formData: CampaignFormData
    errors: Partial<Record<keyof CampaignFormData, string>>
    onFieldChange: <K extends keyof CampaignFormData>(key: K, value: CampaignFormData[K]) => void
    isFieldVisible: (field: FieldConfig) => boolean
}

function FormSection({
    section,
    formData,
    errors,
    onFieldChange,
    isFieldVisible,
}: FormSectionProps) {
    const visibleFields = section.fields.filter(isFieldVisible)

    if (visibleFields.length === 0) {
        return null
    }

    return (
        <div className="space-y-6">
            {section.title && (
                <div className="space-y-1">
                    <h4 className="text-[1em] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        {section.title}
                    </h4>
                    {section.description && (
                        <p className="text-sm text-muted-foreground">{section.description}</p>
                    )}
                </div>
            )}

            <div className={`grid grid-cols-${section?.gridcols ?? 2} gap-6`}>

                {visibleFields.map((field) => (
                    <div
                        key={field.id}
                        className={cn(
                            field.colSpan === 2 && "col-span-2",
                            field.colSpan === 1 && "col-span-1"
                        )}
                    >
                        <FieldRenderer
                            field={field}
                            value={formData[field.id as keyof CampaignFormData]}
                            error={errors[field.id as keyof CampaignFormData]}
                            onChange={(value) => onFieldChange(
                                field.id as keyof CampaignFormData,
                                value as CampaignFormData[keyof CampaignFormData]
                            )}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
