import { notFound } from 'next/navigation';
import { ContentViewer } from '@/components/organisms/ContentViewer';
import { educationalContent } from '@/data/educationalContent';
import { ContentType } from '@/interface-adapters/store/educationStore';

interface PageProps {
  params: Promise<{ contentId: string }>;
}

export async function generateStaticParams() {
  return Object.keys(educationalContent).map((contentId) => ({
    contentId,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { contentId } = await params;
  const content = educationalContent[contentId as ContentType];

  if (!content) {
    return {
      title: 'Content Not Found',
    };
  }

  return {
    title: `${content.title} | Headache Awareness Trainer`,
    description: content.subtitle,
  };
}

export default async function ContentPage({ params }: PageProps) {
  const { contentId } = await params;

  // Validate content ID
  if (!educationalContent[contentId as ContentType]) {
    notFound();
  }

  return (
    <main className="container max-w-2xl mx-auto px-4 py-8">
      <ContentViewer contentId={contentId as ContentType} />
    </main>
  );
}
