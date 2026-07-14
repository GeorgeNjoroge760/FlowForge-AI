import { DocsSidebar } from '@/components/docs/docs-sidebar';

export const metadata = {
  title: 'Docs - FlowForge AI',
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center border-b border-gray-200 bg-white px-6">
        <a href="/" className="text-lg font-bold text-gray-900">
          FlowForge AI
        </a>
        <span className="ml-3 text-sm text-gray-500">Docs</span>
      </header>
      <div className="flex flex-1">
        <DocsSidebar />
        <main className="flex-1 overflow-y-auto px-12 py-10">
          <div className="prose prose-gray max-w-3xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
