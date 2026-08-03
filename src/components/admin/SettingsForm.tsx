import { FieldError } from '../common/FieldError';
import type { Settings } from '../../db/schema';
import { SLIDES_LINK_EXAMPLE, VIDEO_LINK_EXAMPLE } from '../../lib/drive';
import './SettingsForm.css';

export function SettingsForm(props: {
  settings: Settings;
  values?: { videoUrl?: string; slidesUrl?: string };
  errors?: Record<string, string>;
}) {
  const { settings } = props;
  const errors = props.errors ?? {};

  return (
    <form method="post" action="/admin/settings" class="card stack settingsform">
      <label class="field">
        <span class="label">Slides share link</span>
        <input
          name="slidesUrl"
          type="text"
          placeholder={SLIDES_LINK_EXAMPLE}
          value={props.values?.slidesUrl ?? settings.slidesUrl ?? ''}
        />
        <span class="hint">
          Convert the PPTX to native Google Slides first — a .pptx sitting in Drive does not embed
          reliably. Sharing must be “anyone with the link”, and note that the deck contains
          commission rates and internal targets.
        </span>
        <FieldError message={errors.slidesUrl} />
      </label>

      <label class="field">
        <span class="label">Video share link</span>
        <input
          name="videoUrl"
          type="text"
          placeholder={VIDEO_LINK_EXAMPLE}
          value={props.values?.videoUrl ?? settings.videoUrl ?? ''}
        />
        <FieldError message={errors.videoUrl} />
      </label>

      <div class="row">
        <label class="field field-small">
          <span class="label">Pass mark (%)</span>
          <input name="passMark" type="number" min={1} max={100} required value={String(settings.passMark)} />
          <FieldError message={errors.passMark} />
        </label>
        <label class="field field-small">
          <span class="label">Gate (seconds)</span>
          <input
            name="minTutorialSeconds"
            type="number"
            min={0}
            max={3600}
            required
            value={String(settings.minTutorialSeconds)}
          />
          <FieldError message={errors.minTutorialSeconds} />
        </label>
      </div>

      <button class="btn btn-primary" type="submit">
        Save settings
      </button>
    </form>
  );
}

export default SettingsForm;
