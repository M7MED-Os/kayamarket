import { getStoreByIdentifier } from '@/lib/tenant/get-store';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ReactNode } from 'react';
import Providers from '@/components/Providers';
import { incrementStoreViews } from '@/app/actions/analytics';
import PixelManager from '@/components/store/PixelManager';
import { SalesPopup } from '@/components/store/SalesPopup';

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
  const { store, branding, settings } = await getStoreByIdentifier(slug);

  if (!store) {
    notFound();
  }

  // Increment view counter asynchronously (don't block render)
  incrementStoreViews(store.id).catch(console.error);

  const primaryColor = branding?.primary_color || '#e11d48';

  return (
    <div className="min-h-screen">
      <PixelManager 
        fbPixelId={settings?.fb_pixel_id} 
        tiktokPixelId={settings?.tiktok_pixel_id} 
        googleAnalyticsId={settings?.google_analytics_id} 
      />
      {/* Inject primary color CSS variable at layout level */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --store-primary: ${primaryColor};
        }
      `}} />
      <div style={{ '--store-primary': primaryColor } as React.CSSProperties}>
        <Providers>
          {children}
          <SalesPopup storeId={store.id} />
        </Providers>
      </div>
    </div>
  );
}
