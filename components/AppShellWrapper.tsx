import { getSiteContent } from "@/data/content";
import AppShell from "./AppShell";

export default async function AppShellWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getSiteContent();

  return (
    <AppShell contactInfo={content.contactInfo} siteConfig={content.siteConfig}>
      {children}
    </AppShell>
  );
}
