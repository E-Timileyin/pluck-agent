import { AdminShell } from '../../components/admin/AdminShell';
import { Alert } from '../../components/common/Alert';
import { SettingsForm } from '../../components/admin/SettingsForm';
import { TeamCard } from '../../components/admin/TeamCard';
import type { Admin, Settings } from '../../db/schema';

export function SettingsPage(props: {
  admin: Admin;
  settings: Settings;
  admins: Admin[];
  values?: { supportPhone?: string; supportEmail?: string };
  errors?: Record<string, string>;
  teamValues?: { name?: string; email?: string };
  teamErrors?: Record<string, string>;
  notice?: string;
}) {
  return (
    <AdminShell
      title="Settings"
      active="settings"
      admin={props.admin}
      sub="What the sales agents see, the rules they are judged by, and who can change either."
    >
      {props.notice ? <Alert tone="info">{props.notice}</Alert> : null}

      <div class="grid gap-4">
        <SettingsForm settings={props.settings} values={props.values} errors={props.errors} />

        <TeamCard
          admins={props.admins}
          currentId={props.admin.id}
          isSuperAdmin={props.admin.isSuperAdmin}
          values={props.teamValues}
          errors={props.teamErrors}
        />
      </div>
    </AdminShell>
  );
}

export default SettingsPage;
