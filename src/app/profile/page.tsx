import { requireUser } from "@/lib/auth";
import { getListingsByUser, getReviewsForUser } from "@/lib/data";
import DashboardShell from "@/components/dashboard-shell";
import ProfileView from "@/components/profile-view";

export default async function MyProfilePage() {
  const user = await requireUser();

  const [offers, needs, reviews] = await Promise.all([
    getListingsByUser(user.id, "offer"),
    getListingsByUser(user.id, "need"),
    getReviewsForUser(user.id),
  ]);

  return (
    <DashboardShell user={user}>
      <div className="mx-auto max-w-5xl">
        <ProfileView
          user={user}
          offers={offers}
          needs={needs}
          reviews={reviews}
          isOwnProfile={true}
        />
      </div>
    </DashboardShell>
  );
}
