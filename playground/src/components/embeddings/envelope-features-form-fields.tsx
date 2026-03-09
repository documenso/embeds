import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import type { Control, FieldPath } from 'react-hook-form';

import {
  DEFAULT_ENVELOPE_FEATURES_DESCRIPTIONS,
  type TEnvelopeFeatures,
} from './envelope-features';

const SECTION_LABELS: Record<string, string> = {
  general: 'General',
  settings: 'Settings',
  actions: 'Actions',
  envelopeItems: 'Envelope items',
  recipients: 'Recipients',
  fields: 'Fields',
};

type FeaturesFormValues = { features: TEnvelopeFeatures };

export function EnvelopeFeaturesFormFields({ control }: { control: Control<FeaturesFormValues> }) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">Feature Configuration</div>

      {(
        Object.entries(DEFAULT_ENVELOPE_FEATURES_DESCRIPTIONS) as [
          keyof typeof DEFAULT_ENVELOPE_FEATURES_DESCRIPTIONS,
          Record<string, string>,
        ][]
      ).map(([section, descriptions]) => (
        <div key={section} className="space-y-3">
          <div className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            {SECTION_LABELS[section] ?? section}
          </div>
          {(Object.entries(descriptions) as [string, string][])
            .filter(([key, description]) => description !== 'N/A')
            .map(([key, description]) => (
              <FormField
                key={key}
                control={control}
                name={`features.${section}.${key}` as FieldPath<FeaturesFormValues>}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        {description}
                        <span className="text-muted-foreground text-xs">{key}</span>
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            ))}
        </div>
      ))}
    </div>
  );
}
