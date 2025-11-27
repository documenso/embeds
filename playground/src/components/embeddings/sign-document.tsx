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

import { EmbedSignDocument } from '@documenso/embed-react';

const formSchema = z.object({
  token: z.string().min(1, 'Signing token is required'),
  name: z.string().optional(),
  lockName: z.boolean().optional(),
  allowDocumentRejection: z.boolean().optional(),
  darkModeDisabled: z.boolean().optional(),
  css: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function SignDocumentEmbedding() {
  const host = import.meta.env.VITE_EMBED_HOST || 'https://app.documenso.com';

  const [showEmbed, setShowEmbed] = useState(false);
  const [embedKey, setEmbedKey] = useState<number>(1);
  const [embedConfig, setEmbedConfig] = useState<FormData | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: '',
      name: '',
      lockName: false,
      allowDocumentRejection: false,
      darkModeDisabled: false,
      css: '',
    },
  });

  const onSubmit = (data: FormData) => {
    setEmbedConfig(data);
    setShowEmbed(true);
    setEmbedKey((key) => key + 1);
    console.log('Generating Sign Document embedding with config:', data);
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
              <CardTitle>Sign Document Configurator</CardTitle>
              <CardDescription>
                Configure your document signing embedding parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Signing Token</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter signing token..."
                        className="font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The token for the recipient to sign the document
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

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
                name="allowDocumentRejection"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Allow Document Rejection</FormLabel>
                      <FormDescription>Allow the signer to reject the document</FormDescription>
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
                    <FormDescription>Add custom CSS to style the embedded document</FormDescription>
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
          <CardTitle>Sign Document Embedding</CardTitle>
          <CardDescription>Embedded view will appear here</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-muted-foreground/25 m-6 flex min-h-[600px] items-center justify-center rounded-lg border-2 border-dashed">
            {showEmbed && embedConfig ? (
              <EmbedSignDocument
                key={embedKey}
                className="h-[800px] w-full"
                host={host}
                token={embedConfig.token}
                name={embedConfig.name}
                lockName={embedConfig.lockName}
                allowDocumentRejection={embedConfig.allowDocumentRejection}
                darkModeDisabled={embedConfig.darkModeDisabled}
                css={embedConfig.css}
                onDocumentReady={() => console.log('Document ready')}
                onDocumentCompleted={(data) => console.log('Document completed:', data)}
                onDocumentError={(error) => console.error('Document error:', error)}
                onDocumentRejected={(data) => console.log('Document rejected:', data)}
              />
            ) : watchedToken ? (
              <div className="space-y-2 text-center">
                <div className="text-muted-foreground text-sm">
                  Ready to generate embedding iframe
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                Configure signing token above to generate the embedding
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
