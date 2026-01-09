import { EducationHub } from "@/components/organisms/EducationHub";

export const metadata = {
  title: "Learn | Headache Awareness Trainer",
  description: "Educational content about headache types and body awareness",
};

export default function LearnPage() {
  return (
    <main
      className="container max-w-2xl mx-auto px-4 py-8"
      data-testid="learn-page"
    >
      <EducationHub />
    </main>
  );
}
