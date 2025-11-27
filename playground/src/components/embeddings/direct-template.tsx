import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { EmbedDirectTemplate } from '@documenso/embed-react';

const formSchema = z.object({
  token: z.string().min(1, 'Template token is required'),
  externalId: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  lockEmail: z.boolean().optional(),
  name: z.string().optional(),
  lockName: z.boolean().optional(),
  darkModeDisabled: z.boolean().optional(),
  css: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function DirectTemplateEmbedding() {
  const host = import.meta.env.VITE_EMBED_HOST || 'https://app.documenso.com';
  const [showEmbed, setShowEmbed] = useState(false);
  const [embedConfig, setEmbedConfig] = useState<FormData | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: '',
      externalId: '',
      email: '',
      lockEmail: false,
      name: '',
      lockName: false,
      darkModeDisabled: false,
      css: '',
    },
  });

  const onSubmit = (data: FormData) => {
    setEmbedConfig(data);
    setShowEmbed(true);
    console.log('Generating Direct Template embedding with config:', data);
  };

  const handleClear = () => {
    form.reset();
    setShowEmbed(false);
    setEmbedConfig(null);
  };

  const watchedToken = form.watch('token');

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Direct Template Configurator</CardTitle>
              <CardDescription>Configure your direct template embedding parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Token</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter template token..."
                        className="font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>The direct template token</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="externalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>External ID (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter external ID..."
                        className="font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Unique identifier for tracking this template instance
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Pre-fill signer email..." {...field} />
                    </FormControl>
                    <FormDescription>Pre-fill the signer's email</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lockEmail"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Lock Email</FormLabel>
                      <FormDescription>
                        Prevent the signer from changing their email
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Pre-fill signer name..." {...field} />
                    </FormControl>
                    <FormDescription>Pre-fill the signer's name</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lockName"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Lock Name</FormLabel>
                      <FormDescription>Prevent the signer from changing their name</FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="darkModeDisabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Disable Dark Mode</FormLabel>
                      <FormDescription>Force light mode only</FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={form.control}
                name="css"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom CSS (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter custom CSS..."
                        rows={4}
                        className="font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Add custom CSS to style the embedded template</FormDescription>
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

      <Card>
        <CardHeader>
          <CardTitle>Direct Template Embedding</CardTitle>
          <CardDescription>Embedded view will appear here</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-muted-foreground/25 m-6 flex min-h-[600px] items-center justify-center rounded-lg border-2 border-dashed">
            {showEmbed && embedConfig ? (
              <EmbedDirectTemplate
                className="h-[800px] w-full"
                host={host}
                token={embedConfig.token}
                externalId={embedConfig.externalId}
                email={embedConfig.email}
                lockEmail={embedConfig.lockEmail}
                name={embedConfig.name}
                lockName={embedConfig.lockName}
                darkModeDisabled={embedConfig.darkModeDisabled}
                css={embedConfig.css}
                onDocumentReady={() => console.log('Document ready')}
                onDocumentCompleted={(data) => console.log('Document completed:', data)}
                onDocumentError={(error) => console.error('Document error:', error)}
                onFieldSigned={() => console.log('Field signed')}
                onFieldUnsigned={() => console.log('Field unsigned')}
              />
            ) : watchedToken ? (
              <div className="space-y-2 text-center">
                <div className="text-muted-foreground text-sm">
                  Ready to generate embedding iframe
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                Configure template token above to generate the embedding
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
