import { getStoreByIdentifier } from '@/lib/tenant/get-store';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ReactNode } from 'react';
import Providers from '@/components/Providers';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { store, branding } = await getStoreByIdentifier(slug);
  
  if (!store) return {};

  return {
    title: store.name,
    description: branding?.tagline || `Welcome to ${store.name}`,
    icons: {
      icon: branding?.favicon_url || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    },
  };
}

export default async function StoreLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { store, branding } = await getStoreByIdentifier(slug);

  if (!store) {
    notFound();
  }

  const primaryColor = branding?.primary_color || '#e11d48';

  return (
    <div className="min-h-screen">
      {/* Inject primary color CSS variable at layout level */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --store-primary: ${primaryColor};
        }
      `}} />
      <div style={{ '--store-primary': primaryColor } as React.CSSProperties}>
        <Providers>
          {children}
        </Providers>
      </div>
    </div>
  );
}
