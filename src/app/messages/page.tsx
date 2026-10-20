import { requireUser } from "@/lib/auth";
import { getConversationsForUser } from "@/lib/data";
import DashboardShell from "@/components/dashboard-shell";
import ChatPanel from "@/components/chat-panel";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;

  const convs = await getConversationsForUser(user.id);

  const partnerId = sp.partnerId ? Number(sp.partnerId) : null;
  const listingId = sp.listingId ? Number(sp.listingId) : null;
  const collabId = sp.collabId ? Number(sp.collabId) : null;
  const convId = sp.convId ? Number(sp.convId) : null;

  return (
    <DashboardShell user={user}>
      <div className="mx-auto max-w-6xl">
        <ChatPanel
          currentUser={user}
          initialConversations={convs}
          initialActiveId={convId}
          targetPartnerId={partnerId}
          targetListingId={listingId}
          targetCollabId={collabId}
        />
      </div>
    </DashboardShell>
  );
}
