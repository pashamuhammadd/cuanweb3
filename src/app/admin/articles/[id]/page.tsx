import { notFound } from "next/navigation";
import { getArticleForAdmin } from "@/lib/data/admin-articles";
import { ArticleForm } from "@/components/admin/article-form";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticleForAdmin(id);

  if (!article) notFound();

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-offwhite">Edit artikel</h1>
      <div className="mt-5 max-w-2xl">
        <ArticleForm article={article} />
      </div>
    </div>
  );
}
