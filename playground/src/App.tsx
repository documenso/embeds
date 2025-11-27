import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import './App.css';
import CreateDocumentEmbedding from './components/embeddings/create-document';
import CreateTemplateEmbedding from './components/embeddings/create-template';
import DirectTemplateEmbedding from './components/embeddings/direct-template';
import MultiSignEmbedding from './components/embeddings/multisign';
import SignDocumentEmbedding from './components/embeddings/sign-document';
import UpdateDocumentEmbedding from './components/embeddings/update-document';
import UpdateTemplateEmbedding from './components/embeddings/update-template';

export default function App() {
  return (
    <div className="mx-auto w-full max-w-screen-lg p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Embedding Test Bed</h1>
        <p className="text-muted-foreground mt-2">
          Configure and test different types of embeddings
        </p>
      </div>

      <Tabs defaultValue="sign-document" className="mt-8 w-full">
        <TabsList className="mb-2">
          <TabsTrigger value="sign-document">Sign Document</TabsTrigger>
          <TabsTrigger value="direct-template">Direct Template</TabsTrigger>
          <TabsTrigger value="multi-sign">Multi Sign</TabsTrigger>
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
