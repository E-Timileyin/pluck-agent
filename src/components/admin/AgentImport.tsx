import { FiAlertTriangle, FiUpload } from 'react-icons/fi';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Field } from '../common/Field';

/**
 * Upload the file, nothing else. Nothing lands until the whole sheet
 * validates — a half-imported roster is worse than none, because there's no
 * way to tell who is missing.
 *
 * Re-importing the same Sales Agent ID updates that row (corrected phone,
 * email, name) rather than creating a duplicate.
 */
export function AgentImport(props: { errors?: string[] }) {
  return (
    <Card title="Bulk upload" sub="The whole roster at once, exported from the main app.">
      {props.errors && props.errors.length > 0 ? (
        <div class="mb-4 rounded-xl bg-[#ffe6e0] p-4" role="alert">
          <p class="m-0 mb-2 flex items-center gap-2 text-[15px] font-medium text-miss">
            <FiAlertTriangle size={18} />
            Nothing was imported.
          </p>
          <ul class="m-0 grid list-none gap-1 p-0 text-sm text-ink">
            {props.errors.map((error) => (
              <li>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <form
        method="post"
        action="/admin/promoters/import"
        enctype="multipart/form-data"
        class="grid gap-5"
      >
        <Field
          label="Excel sheet"
          hint="The .xlsx file exported straight from the main app. A .csv or .tsv works too. First row must be a header: Sales Agent ID, Name, Email, Phone."
        >
          <input
            class="w-full rounded-xl border border-line bg-white p-3 text-[15px] text-ink file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand-mint file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-brand-ink"
            type="file"
            name="file"
            accept=".xlsx,.xls,.csv,.tsv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,text/tab-separated-values,text/plain"
            required
          />
        </Field>

        <div>
          <Button type="submit">
            <FiUpload size={18} />
            Upload roster
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default AgentImport;
