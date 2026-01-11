import { notFound } from "next/navigation";
import { ContentViewer } from "@/components/organisms/ContentViewer";
import { educationalContent } from "@/data/educationalContent";
import { ContentType } from "@/interface-adapters/store/educationStore";
import { getTranslations } from "next-intl/server";

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
      title: "Content Not Found",
    };
  }

  // Get server-side translations for metadata
  const t = await getTranslations("content");

  return {
    title: `${t(content.titleKey)} | Headache Awareness Trainer`,
    description: t(content.subtitleKey),
  };
}

export default async function ContentPage({ params }: PageProps) {
  const { contentId } = await params;

  // Validate content ID
  if (!educationalContent[contentId as ContentType]) {
    notFound();
  }

  return (
    <main
      className="container max-w-2xl mx-auto px-4 py-8"
      data-testid="content-page"
    >
      <ContentViewer contentId={contentId as ContentType} />
    </main>
  );
}
