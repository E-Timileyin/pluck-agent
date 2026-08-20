import { AdminShell } from '../../components/admin/AdminShell';
import { Alert } from '../../components/common/Alert';
import { SingleAgentForm, type SingleAgentValues } from '../../components/admin/SingleAgentForm';
import { AgentImport } from '../../components/admin/AgentImport';
import type { Admin } from '../../db/schema';

export function AgentImportPage(props: {
  admin: Admin;
  notice?: string;
  singleValues?: SingleAgentValues;
  singleErrors?: Record<string, string>;
  importErrors?: string[];
}) {
  return (
    <AdminShell
      title="Add sales agents"
      active="promoters"
      admin={props.admin}
      sub="One agent at a time, or the whole roster from a spreadsheet."
    >
      {props.notice ? <Alert tone="info">{props.notice}</Alert> : null}

      <div class="grid gap-5 lg:grid-cols-2 lg:items-start">
        <SingleAgentForm values={props.singleValues} errors={props.singleErrors} />
        <AgentImport errors={props.importErrors} />
      </div>
    </AdminShell>
  );
}

export default AgentImportPage;
