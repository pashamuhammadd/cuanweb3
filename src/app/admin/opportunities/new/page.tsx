import { OpportunityForm } from "@/components/admin/opportunity-form";

export default function NewOpportunityPage() {
  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-offwhite">Tambah peluang</h1>
      <div className="mt-5 max-w-2xl">
        <OpportunityForm />
      </div>
    </div>
  );
}
