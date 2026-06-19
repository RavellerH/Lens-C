import { useState } from 'react';
import { tmdbAdapter } from '../../services/adapters/tmdb/tmdbAdapter';
import { useSettings } from '../../app/store/settingsStore';
import './ApiKeyForm.css';

type ValidationStatus = 'idle' | 'checking' | 'valid' | 'invalid';

export function ApiKeyForm() {
  const { settings, updateSettings } = useSettings();
  const [draftKey, setDraftKey] = useState(settings.tmdbApiKey);
  const [status, setStatus] = useState<ValidationStatus>(settings.tmdbApiKey ? 'valid' : 'idle');

  const handleSave = async () => {
    const trimmed = draftKey.trim();
    if (!trimmed) {
      updateSettings({ tmdbApiKey: '' });
      setStatus('idle');
      return;
    }
    setStatus('checking');
    const isValid = await tmdbAdapter.validateKey(trimmed);
    if (isValid) {
      updateSettings({ tmdbApiKey: trimmed });
      setStatus('valid');
    } else {
      setStatus('invalid');
    }
  };

  return (
    <div className="api-key-form">
      <div className="api-key-form__row">
        <input
          type="password"
          placeholder="Paste your TMDb API key"
          value={draftKey}
          onChange={(event) => setDraftKey(event.target.value)}
          aria-label="TMDb API key"
        />
        <button type="button" onClick={handleSave} disabled={status === 'checking'}>
          {status === 'checking' ? 'Checking…' : 'Save key'}
        </button>
      </div>
      {status === 'valid' && <p className="api-key-form__status api-key-form__status--valid">Key saved and verified.</p>}
      {status === 'invalid' && (
        <p className="api-key-form__status api-key-form__status--invalid">That key didn't validate. Double-check it and try again.</p>
      )}
      {status === 'checking' && <p className="api-key-form__status api-key-form__status--checking">Verifying with TMDb…</p>}
      <p className="api-key-form__help">
        Free at{' '}
        <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer">
          themoviedb.org/settings/api
        </a>
        . Stored only in your browser, never sent anywhere but TMDb.
      </p>
    </div>
  );
}
