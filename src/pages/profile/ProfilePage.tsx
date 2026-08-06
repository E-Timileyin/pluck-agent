import { PromoterShell } from '../../components/common/PromoterShell';
import { PageHeader } from '../../components/common/PageHeader';
import { Alert } from '../../components/common/Alert';
import { ProfileForm } from '../../components/profile/ProfileForm';
import { PhotoCard } from '../../components/profile/PhotoCard';
import { AccountSummary } from '../../components/profile/AccountSummary';
import type { Attempt } from '../../db/schema';
import type { Shell } from '../../lib/shell';

export function ProfilePage(props: {
  shell: Shell;
  attempts: Attempt[];
  values?: { name?: string; email?: string };
  errors?: Record<string, string>;
  /** Upload rejections come back through the URL, not the form validator. */
  photoError?: string;
  saved?: boolean;
}) {
  return (
    <PromoterShell
      title="Profile"
      shell={props.shell}
      active="profile"
      wide
      header={<PageHeader title="Profile" sub="Who this training record belongs to." />}
    >
      {props.saved ? <Alert tone="info">Saved.</Alert> : null}

      <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <div class="grid gap-3 lg:col-span-2">
          <PhotoCard
            name={props.shell.promoter.name}
            photoHref={props.shell.photoHref}
            error={props.photoError}
          />

          <ProfileForm
            promoter={props.shell.promoter}
            values={props.values}
            errors={props.errors}
          />
        </div>

        <AccountSummary
          promoter={props.shell.promoter}
          attempts={props.attempts}
          photoHref={props.shell.photoHref}
        />
      </div>
    </PromoterShell>
  );
}

export default ProfilePage;
