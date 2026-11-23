import { notFound } from "next/navigation";
import { getOpportunityForAdmin } from "@/lib/data/admin-opportunities";
import { OpportunityForm } from "@/components/admin/opportunity-form";

export default async function EditOpportunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const opportunity = await getOpportunityForAdmin(id);

  if (!opportunity) notFound();

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-offwhite">Edit peluang</h1>
      <div className="mt-5 max-w-2xl">
        <OpportunityForm opportunity={opportunity} />
      </div>
    </div>
  );
}
