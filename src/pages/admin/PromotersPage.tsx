import { FiUserPlus } from 'react-icons/fi';
import { AdminShell } from '../../components/admin/AdminShell';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
import { PromotersTable } from '../../components/admin/PromotersTable';
import { SearchField } from '../../components/admin/SearchField';
import type { PromoterRow } from '../../db/queries';
import type { Admin } from '../../db/schema';

export function PromotersPage(props: {
  admin: Admin;
  rows: PromoterRow[];
  search?: string;
  notice?: string;
}) {
  return (
    <AdminShell
      title="Sales Agents"
      active="promoters"
      admin={props.admin}
      sub={
        props.search
          ? `Matching “${props.search}”`
          : 'Imported from the main app. Sign-in checks Sales Agent ID, phone and email against this roster.'
      }
      actions={
        <>
          <SearchField action="/admin/promoters" value={props.search} placeholder="Search by name" />
          <Button href="/admin/promoters/import" tone="ghost">
            <FiUserPlus size={18} />
            Add sales agents
          </Button>
        </>
      }
    >
      {props.notice ? <Alert tone="info">{props.notice}</Alert> : null}

      <PromotersTable rows={props.rows} searching={!!props.search} />
    </AdminShell>
  );
}

export default PromotersPage;
