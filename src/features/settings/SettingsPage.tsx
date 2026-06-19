import { useRef, useState, type ChangeEvent } from 'react';
import { useSettings } from '../../app/store/settingsStore';
import { useLibrary } from '../../app/store/libraryStore';
import { clearAllCaches } from '../../services/cache/indexedDbCache';
import type { RecencyMode } from '../../types/settings';
import './SettingsPage.css';

const RECENCY_OPTIONS: { value: RecencyMode; label: string }[] = [
  { value: 'new-and-hot', label: 'New & Hot' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'all-time', label: 'All Time' },
  { value: 'classics-friendly', label: 'Classics Friendly' },
];

export function SettingsPage() {
  const { settings, updateSettings, resetAppData } = useSettings();
  const { importLetterboxdFiles, importing, lastImportResult } = useLibrary();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resetConfirming, setResetConfirming] = useState(false);

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;
    const files = await Promise.all(
      Array.from(fileList).map(async (file) => ({ name: file.name, text: await file.text() })),
    );
    await importLetterboxdFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    if (!resetConfirming) {
      setResetConfirming(true);
      return;
    }
    resetAppData();
    clearAllCaches();
    setResetConfirming(false);
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      <section className="settings-section">
        <h2>Region</h2>
        <p className="settings-section__desc">Controls which country's TV schedule and movie charts surface first.</p>
        <div className="settings-field">
          <label htmlFor="region">Region</label>
          <select id="region" value={settings.region} onChange={(event) => updateSettings({ region: event.target.value })}>
            <option value="US">United States</option>
            <option value="GB">United Kingdom</option>
            <option value="CA">Canada</option>
            <option value="AU">Australia</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
            <option value="IN">India</option>
          </select>
        </div>
      </section>

      <section className="settings-section">
        <h2>Recommendation tuning</h2>
        <p className="settings-section__desc">How strongly should recommendations favor new and currently trending titles?</p>
        <div className="settings-field">
          <label htmlFor="recency">Recency mode</label>
          <select
            id="recency"
            value={settings.defaultRecencyMode}
            onChange={(event) => updateSettings({ defaultRecencyMode: event.target.value as RecencyMode })}
          >
            {RECENCY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="settings-field">
          <label htmlFor="explanations">Show recommendation reasons</label>
          <input
            id="explanations"
            type="checkbox"
            checked={settings.showExplanations}
            onChange={(event) => updateSettings({ showExplanations: event.target.checked })}
          />
        </div>
        <div className="settings-field">
          <label htmlFor="mature">Include mature content</label>
          <input
            id="mature"
            type="checkbox"
            checked={settings.includeMature}
            onChange={(event) => updateSettings({ includeMature: event.target.checked })}
          />
        </div>
      </section>

      <section className="settings-section">
        <h2>Appearance</h2>
        <div className="settings-field">
          <label htmlFor="animations">Enable animations</label>
          <input
            id="animations"
            type="checkbox"
            checked={settings.enableAnimations}
            onChange={(event) => updateSettings({ enableAnimations: event.target.checked })}
          />
        </div>
      </section>

      <section className="settings-section">
        <h2>Data sources</h2>
        <p className="settings-section__desc">Connect optional sources to deepen personalization.</p>

        <div className="settings-field" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
          <label>Letterboxd export (diary.csv, ratings.csv, or watched.csv)</label>
          <div className="settings-row">
            <input ref={fileInputRef} type="file" accept=".csv" multiple onChange={handleFileSelect} disabled={importing} />
          </div>
          {importing && <p className="settings-section__note">Matching your titles against Apple and TVmaze…</p>}
          {lastImportResult && (
            <p className="settings-import-result">
              Imported {lastImportResult.matched} titles{lastImportResult.unmatched > 0 ? ` (${lastImportResult.unmatched} couldn't be matched)` : ''}.
            </p>
          )}
        </div>

        <div className="settings-field">
          <label>Trakt</label>
          <div className="settings-row">
            <button type="button" disabled title="Trakt OAuth sync is planned for a future release">
              Connect Trakt (coming soon)
            </button>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h2>Privacy</h2>
        <p className="settings-section__desc">
          Everything lives in your browser — no account, no server. Clearing data removes your key, watchlist, and imports
          from this device.
        </p>
        <div className="settings-row">
          <button type="button" className="settings-danger-btn" onClick={handleReset}>
            {resetConfirming ? 'Click again to confirm reset' : 'Reset app data'}
          </button>
        </div>
      </section>
    </div>
  );
}
