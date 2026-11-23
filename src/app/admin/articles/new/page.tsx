import { ArticleForm } from "@/components/admin/article-form";

export default function NewArticlePage() {
  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-offwhite">Tulis artikel</h1>
      <div className="mt-5 max-w-2xl">
        <ArticleForm />
      </div>
    </div>
  );
}
