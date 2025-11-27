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

import { unstable_EmbedUpdateTemplate as EmbedUpdateTemplate } from '@documenso/embed-react';

const formSchema = z
  .object({
    useApiKey: z.boolean(),
    apiKey: z.string().optional(),
    presignToken: z.string().optional(),
    templateId: z.coerce.number(),
    externalId: z.string().optional(),
    onlyEditFields: z.boolean().optional(),
    allowConfigureSignatureTypes: z.boolean().optional(),
    allowConfigureLanguage: z.boolean().optional(),
    allowConfigureDateFormat: z.boolean().optional(),
    allowConfigureTimezone: z.boolean().optional(),
    allowConfigureRedirectUrl: z.boolean().optional(),
    allowConfigureCommunication: z.boolean().optional(),
    darkModeDisabled: z.boolean().optional(),
    css: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.useApiKey) {
        return !!data.apiKey && data.apiKey.length > 0;
      }
      return !!data.presignToken && data.presignToken.length > 0;
    },
    {
      message: 'Either API key or presign token is required',
      path: ['apiKey'],
    },
  );

type FormData = z.infer<typeof formSchema>;

export default function UpdateTemplateEmbedding() {
  const host = import.meta.env.VITE_EMBED_HOST || 'https://app.documenso.com';
  const [showEmbed, setShowEmbed] = useState(false);
  const [embedConfig, setEmbedConfig] = useState<
    (Omit<FormData, 'useApiKey' | 'apiKey'> & { presignToken: string }) | null
  >(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      useApiKey: true,
      apiKey: '',
      presignToken: '',
      templateId: 1,
      externalId: '',
      onlyEditFields: false,
      allowConfigureSignatureTypes: true,
      allowConfigureLanguage: true,
      allowConfigureDateFormat: true,
      allowConfigureTimezone: true,
      allowConfigureRedirectUrl: true,
      allowConfigureCommunication: true,
      darkModeDisabled: false,
      css: '',
    },
  });

  const generatePresignToken = async (apiKey: string) => {
    const response = await fetch(`${host}/api/v2-beta/embedding/create-presign-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        expiresIn: 60,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to parse error' }));
      throw new Error(errorData.message || `Failed to generate presign token: ${response.status}`);
    }

    const data = await response.json();
    return data.token;
  };

  const onSubmit = async (data: FormData) => {
    setIsGenerating(true);
    setError(null);

    try {
      let token = data.presignToken || '';

      if (data.useApiKey && data.apiKey) {
        token = await generatePresignToken(data.apiKey);
      }

      setEmbedConfig({ ...data, presignToken: token });
      setShowEmbed(true);
      console.log('Generating Update Template embedding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate token');
      console.error('Error generating presign token:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    form.reset();
    setShowEmbed(false);
    setEmbedConfig(null);
    setError(null);
  };

  const useApiKey = form.watch('useApiKey');
  const watchedValue = useApiKey ? form.watch('apiKey') : form.watch('presignToken');

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Update Template Configurator</CardTitle>
              <CardDescription>
                Configure your template editing embedding parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="useApiKey"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Use API Key to Generate Token</FormLabel>
                      <FormDescription>
                        Check this to automatically generate a presign token from your API key
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {useApiKey ? (
                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your API key..."
                          className="font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Your Documenso API key to generate a presign token
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="presignToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Presign Token</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter presign token..."
                          className="font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A presign token generated from your backend server
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Separator />

              <FormField
                control={form.control}
                name="templateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template ID</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter template ID..."
                        className="font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>The ID of the template to update</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

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
                    <FormDescription>Unique identifier for tracking this template</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="space-y-3">
                <div className="text-sm font-medium">Feature Configuration</div>

                <FormField
                  control={form.control}
                  name="allowConfigureSignatureTypes"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Allow Configure Signature Types</FormLabel>
                        <FormDescription>
                          Allow users to configure signature field types
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="onlyEditFields"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Only Edit Fields</FormLabel>
                        <FormDescription>Allow users to only configure fields</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allowConfigureLanguage"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Allow Configure Language</FormLabel>
                        <FormDescription>
                          Allow users to configure document language
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allowConfigureDateFormat"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Allow Configure Date Format</FormLabel>
                        <FormDescription>Allow users to configure date format</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allowConfigureTimezone"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Allow Configure Timezone</FormLabel>
                        <FormDescription>Allow users to configure timezone</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allowConfigureRedirectUrl"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Allow Configure Redirect URL</FormLabel>
                        <FormDescription>Allow users to set redirect URL</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allowConfigureCommunication"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Allow Configure Communication</FormLabel>
                        <FormDescription>
                          Allow users to configure email notifications
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

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
                    <FormDescription>Add custom CSS to style the embedded editor</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!form.formState.isValid || isGenerating}
                >
                  {isGenerating ? 'Generating Token...' : 'Generate Embedding'}
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
          <CardTitle>Update Template Embedding</CardTitle>
          <CardDescription>Embedded authoring view will appear here</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-muted-foreground/25 m-6 flex min-h-[600px] items-center justify-center rounded-lg border-2 border-dashed">
            {showEmbed && embedConfig ? (
              <EmbedUpdateTemplate
                className="h-[800px] w-full"
                host={host}
                templateId={embedConfig.templateId}
                presignToken={embedConfig.presignToken}
                externalId={embedConfig.externalId}
                features={{
                  allowConfigureSignatureTypes: embedConfig.allowConfigureSignatureTypes,
                  allowConfigureLanguage: embedConfig.allowConfigureLanguage,
                  allowConfigureDateFormat: embedConfig.allowConfigureDateFormat,
                  allowConfigureTimezone: embedConfig.allowConfigureTimezone,
                  allowConfigureRedirectUrl: embedConfig.allowConfigureRedirectUrl,
                  allowConfigureCommunication: embedConfig.allowConfigureCommunication,
                }}
                darkModeDisabled={embedConfig.darkModeDisabled}
                onlyEditFields={embedConfig.onlyEditFields}
                css={embedConfig.css}
                onTemplateUpdated={(data) => console.log('Template updated:', data)}
              />
            ) : watchedValue ? (
              <div className="space-y-2 text-center">
                <div className="text-muted-foreground text-sm">
                  Ready to generate embedding iframe
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                Configure {useApiKey ? 'API key' : 'presign token'} above to generate the embedding
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
