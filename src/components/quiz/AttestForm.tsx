import './AttestForm.css';

/** Not optional, and not skippable — no checkbox, no result. */
export function AttestForm() {
  return (
    <form method="post" action="/attest" class="card stack attest">
      <label class="checkline">
        <input type="checkbox" name="confirm" value="on" required />
        <span>I have read and understood these rules.</span>
      </label>
      <button class="btn btn-primary" type="submit">
        Confirm and see my result
      </button>
    </form>
  );
}

export default AttestForm;
