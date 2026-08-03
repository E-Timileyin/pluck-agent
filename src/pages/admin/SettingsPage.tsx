import { Layout } from '../../components/common/Layout';
import { Alert } from '../../components/common/Alert';
import { SettingsForm } from '../../components/admin/SettingsForm';
import type { Settings } from '../../db/schema';

export function SettingsPage(props: {
  settings: Settings;
  values?: { videoUrl?: string; slidesUrl?: string };
  errors?: Record<string, string>;
  saved?: boolean;
}) {
  return (
    <Layout title="Settings" variant="admin">
      <h1>Settings</h1>
      {props.saved ? <Alert tone="info">Saved.</Alert> : null}
      <SettingsForm settings={props.settings} values={props.values} errors={props.errors} />
      <p class="muted small">
        Paste the normal share link — the file ID is extracted and the embed URL is what gets
        stored, so /learn does no parsing at render.
      </p>
    </Layout>
  );
}

export default SettingsPage;
