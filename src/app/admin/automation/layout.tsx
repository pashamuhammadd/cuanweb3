import type { ReactNode } from "react";
import { AutomationNav } from "@/components/admin/automation/automation-nav";

export default function AutomationLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-offwhite">Automation Center</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        CuanWeb3 Opportunity Engine — pencarian, pengolahan, dan publikasi peluang otomatis dengan anggaran Rp0.
      </p>
      <AutomationNav />
      <div className="mt-6">{children}</div>
    </div>
  );
}
