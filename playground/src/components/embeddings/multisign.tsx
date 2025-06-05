import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { unstable_EmbedMultiSignDocument as EmbedMultiSignDocument } from '@documenso/embed-react';

const formSchema = z.object({
  signingTokens: z
    .string()
    .min(1, 'At least one signing token is required')
    .refine((value) => {
      const tokens = value.split('\n').filter((line) => line.trim());
      return tokens.length > 0;
    }, 'Please enter at least one valid signing token'),
});

type FormData = z.infer<typeof formSchema>;

export default function MultiSignEmbedding() {
  const host = import.meta.env.VITE_EMBED_HOST || 'https://app.documenso.com';
  const [showEmbed, setShowEmbed] = useState(false);
  const [tokens, setTokens] = useState<string[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      signingTokens: '',
    },
  });

  const onSubmit = (data: FormData) => {
    const parsedTokens = data.signingTokens.split('\n').filter((line) => line.trim());
    setTokens(parsedTokens);
    setShowEmbed(true);
    console.log('Generating Multi Sign embedding with tokens:', parsedTokens);
  };

  const handleClear = () => {
    form.reset();
    setShowEmbed(false);
    setTokens([]);
  };

  const watchedTokens = form.watch('signingTokens');
  const tokenCount = watchedTokens.split('\n').filter((line) => line.trim()).length;

  return (
    <div className="space-y-6">
      {/* Configurator */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Multi Sign Configurator</CardTitle>
              <CardDescription>Configure your multi-signature embedding parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="signingTokens"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Signing Tokens</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter signing tokens, one per line..."
                        rows={6}
                        className="font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter one signing token per line. Each token represents a signer.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={!form.formState.isValid}>
                  Generate Embedding
                </Button>
                <Button type="button" variant="outline" onClick={handleClear}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>

      {/* Embedding Display */}
      <Card>
        <CardHeader>
          <CardTitle>Multi Sign Embedding</CardTitle>
          <CardDescription>Embedded view will appear here</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-muted-foreground/25 m-6 flex min-h-[600px] items-center justify-center rounded-lg border-2 border-dashed">
            {showEmbed && tokens.length > 0 ? (
              <EmbedMultiSignDocument className="h-[800px] w-full" host={host} tokens={tokens} />
            ) : watchedTokens ? (
              <div className="space-y-2 text-center">
                <div className="text-muted-foreground text-sm">
                  Ready to generate embedding iframe
                </div>
                <div className="text-muted-foreground text-xs">{tokenCount} tokens configured</div>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                Configure signing tokens above to generate the embedding
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
