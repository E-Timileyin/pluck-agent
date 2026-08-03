import { Layout } from '../../components/common/Layout';
import { DashboardTiles } from '../../components/admin/DashboardTiles';
import { AttemptsTable } from '../../components/admin/AttemptsTable';
import type { AttemptRow, DashboardStats } from '../../db/queries';

export function DashboardPage(props: { stats: DashboardStats; rows: AttemptRow[] }) {
  return (
    <Layout title="Overview" variant="admin">
      <h1>Overview</h1>
      <DashboardTiles stats={props.stats} />
      <h2>
        Attempts <span class="muted small">({props.stats.attempts})</span>
      </h2>
      <AttemptsTable rows={props.rows} />
    </Layout>
  );
}

export default DashboardPage;
