import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import {
  getUserProfile,
  getListingsByUser,
  getReviewsForUser,
} from "@/lib/data";
import DashboardShell from "@/components/dashboard-shell";
import ProfileView from "@/components/profile-view";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const currentUser = await getSessionUser();
  const { id } = await params;

  const numId = Number(id);
  const targetUser = await getUserProfile(isNaN(numId) ? id : numId);

  if (!targetUser) {
    notFound();
  }

  const isOwn = currentUser?.id === targetUser.id;

  const [offers, needs, reviews] = await Promise.all([
    getListingsByUser(targetUser.id, "offer"),
    getListingsByUser(targetUser.id, "need"),
    getReviewsForUser(targetUser.id),
  ]);

  return (
    <DashboardShell user={currentUser}>
      <div className="mx-auto max-w-5xl">
        <ProfileView
          user={targetUser}
          offers={offers}
          needs={needs}
          reviews={reviews}
          isOwnProfile={isOwn}
        />
      </div>
    </DashboardShell>
  );
}
