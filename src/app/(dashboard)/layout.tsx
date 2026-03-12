import { ReactNode } from "react";
import { WalletProvider } from "@/contexts/WalletContext";
import ProjectInvitationsBanner from "@/components/ui/project-invitations-banner";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <WalletProvider>
      <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
        <div className="px-4 pt-16 md:px-8 md:pt-4">
          <ProjectInvitationsBanner />
        </div>
        {children}
      </div>
    </WalletProvider>
  );
}
