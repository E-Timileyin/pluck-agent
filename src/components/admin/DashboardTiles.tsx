import { FiAward, FiPlayCircle, FiShield, FiUser } from 'react-icons/fi';
import type { DashboardStats } from '../../db/queries';
import './DashboardTiles.css';

export function DashboardTiles(props: { stats: DashboardStats }) {
  const { stats } = props;

  return (
    <div class="tiles">
      <div class="tile">
        <span class="tile-icon" aria-hidden="true">
          <FiUser size={22}  />
        </span>
        <p class="tile-label">Attempts</p>
        <p class="tile-value">{stats.attempts}</p>
        <p class="tile-note">
          {stats.uniquePromoters} unique {stats.uniquePromoters === 1 ? 'promoter' : 'promoters'}
        </p>
      </div>

      <div class="tile">
        <span class="tile-icon" aria-hidden="true">
          <FiAward size={22}  />
        </span>
        <p class="tile-label">Pass rate</p>
        <p class="tile-value">{stats.passRate === null ? '—' : `${stats.passRate}%`}</p>
        {stats.passRate === null ? null : (
          <span class="progressbar tile-bar">
            <span class="progressbar-fill" style={`width:${stats.passRate}%`}></span>
          </span>
        )}
        <p class="tile-note">{stats.completed} completed</p>
      </div>

      <div class="tile">
        <span class="tile-icon" aria-hidden="true">
          <FiPlayCircle size={22}  />
        </span>
        <p class="tile-label">Format split</p>
        <p class="tile-value">
          {stats.formatSplit.slides} / {stats.formatSplit.video}
        </p>
        <p class="tile-note">slides / video — tells you whether video is worth producing</p>
      </div>

      {/* The only tile that says something about the training material rather
          than the agents. If everyone misses the commission question, the deck
          is unclear, not the promoters. */}
      <div class="tile tile-wide tile-flag">
        <span class="tile-icon" aria-hidden="true">
          <FiShield size={22}  />
        </span>
        <p class="tile-label">Most-missed question</p>
        {stats.mostMissed ? (
          <>
            <p class="tile-copy">{stats.mostMissed.prompt}</p>
            <p class="tile-note">
              missed {stats.mostMissed.missed} of {stats.mostMissed.asked} times
            </p>
          </>
        ) : (
          <p class="tile-copy muted">Nothing missed yet.</p>
        )}
      </div>
    </div>
  );
}

export default DashboardTiles;
