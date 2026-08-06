import { AdminShell } from '../../components/admin/AdminShell';
import { PromotersTable } from '../../components/admin/PromotersTable';
import { SearchField } from '../../components/admin/SearchField';
import type { PromoterRow } from '../../db/queries';
import type { Admin } from '../../db/schema';

export function PromotersPage(props: { admin: Admin; rows: PromoterRow[]; search?: string }) {
  return (
    <AdminShell
      title="Sales Agents"
      active="promoters"
      admin={props.admin}
      sub={
        props.search
          ? `Matching “${props.search}”`
          : 'Everyone who has started the training, most recent first.'
      }
      actions={
        <SearchField action="/admin/promoters" value={props.search} placeholder="Search by name" />
      }
    >
      <PromotersTable rows={props.rows} searching={!!props.search} />
    </AdminShell>
  );
}

export default PromotersPage;
