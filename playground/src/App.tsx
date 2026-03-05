import { useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import './App.css';
import CreateDocumentEmbedding from './components/embeddings/create-document';
import CreateEnvelopeEmbedding from './components/embeddings/create-envelope';
import CreateTemplateEmbedding from './components/embeddings/create-template';
import DirectTemplateEmbedding from './components/embeddings/direct-template';
import MultiSignEmbedding from './components/embeddings/multisign';
import SignDocumentEmbedding from './components/embeddings/sign-document';
import UpdateDocumentEmbedding from './components/embeddings/update-document';
import UpdateEnvelopeEmbedding from './components/embeddings/update-envelope';
import UpdateTemplateEmbedding from './components/embeddings/update-template';

const VALID_TABS = [
  'sign-document',
  'direct-template',
  'multi-sign',
  'create-envelope',
  'update-envelope',
  'create-document',
  'update-document',
  'create-template',
  'update-template',
] as const;

type Tab = (typeof VALID_TABS)[number];

const DEFAULT_TAB: Tab = 'sign-document';

function getTabFromUrl(): Tab {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab');
  if (tab && VALID_TABS.includes(tab as Tab)) {
    return tab as Tab;
  }
  return DEFAULT_TAB;
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<Tab>(getTabFromUrl);

  const handleTabChange = (value: string) => {
    const tab = value as Tab;
    setCurrentTab(tab);

    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <div className="mx-auto w-full max-w-screen-lg p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Embedding Test Bed</h1>
        <p className="text-muted-foreground mt-2">
          Configure and test different types of embeddings
        </p>
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange} className="mt-8 w-full">
        <TabsList className="mb-2">
          <TabsTrigger value="sign-document">Sign Document</TabsTrigger>
          <TabsTrigger value="direct-template">Direct Template</TabsTrigger>
          <TabsTrigger value="multi-sign">Multi Sign</TabsTrigger>
          <TabsTrigger value="create-envelope">Create Envelope</TabsTrigger>
          <TabsTrigger value="update-envelope">Update Envelope</TabsTrigger>
          <TabsTrigger value="create-document">Create Document</TabsTrigger>
          <TabsTrigger value="update-document">Update Document</TabsTrigger>
          <TabsTrigger value="create-template">Create Template</TabsTrigger>
          <TabsTrigger value="update-template">Update Template</TabsTrigger>
        </TabsList>

        <TabsContent value="sign-document" className="mt-6">
          <SignDocumentEmbedding />
        </TabsContent>

        <TabsContent value="direct-template" className="mt-6">
          <DirectTemplateEmbedding />
        </TabsContent>

        <TabsContent value="multi-sign" className="mt-6">
          <MultiSignEmbedding />
        </TabsContent>

        <TabsContent value="create-envelope" className="mt-6">
          <CreateEnvelopeEmbedding />
        </TabsContent>

        <TabsContent value="update-envelope" className="mt-6">
          <UpdateEnvelopeEmbedding />
        </TabsContent>

        <TabsContent value="create-document" className="mt-6">
          <CreateDocumentEmbedding />
        </TabsContent>

        <TabsContent value="update-document" className="mt-6">
          <UpdateDocumentEmbedding />
        </TabsContent>

        <TabsContent value="create-template" className="mt-6">
          <CreateTemplateEmbedding />
        </TabsContent>

        <TabsContent value="update-template" className="mt-6">
          <UpdateTemplateEmbedding />
        </TabsContent>
      </Tabs>
    </div>
  );
}
