import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import './App.css';
import MultiSignEmbedding from './components/embeddings/multisign';

export default function App() {
  return (
    <div className="mx-auto w-full max-w-screen-lg p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Embedding Test Bed</h1>
        <p className="text-muted-foreground mt-2">
          Configure and test different types of embeddings
        </p>
      </div>

      <Tabs defaultValue="multi-sign" className="mt-8 w-full">
        <TabsList className="mb-2">
          <TabsTrigger value="multi-sign">Multi Sign</TabsTrigger>
        </TabsList>

        <TabsContent value="multi-sign" className="mt-6">
          <MultiSignEmbedding />
        </TabsContent>
      </Tabs>
    </div>
  );
}
