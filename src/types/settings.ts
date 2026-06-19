export type RecencyMode = 'new-and-hot' | 'balanced' | 'all-time' | 'classics-friendly';
export type ThemeMode = 'dark' | 'midnight';

export interface AppSettings {
  tmdbApiKey: string;
  region: string;
  language: string;
  theme: ThemeMode;
  defaultRecencyMode: RecencyMode;
  includeMature: boolean;
  useTrakt: boolean;
  traktToken?: string;
  showExplanations: boolean;
  enableAnimations: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  tmdbApiKey: '',
  region: 'US',
  language: 'en-US',
  theme: 'dark',
  defaultRecencyMode: 'new-and-hot',
  includeMature: false,
  useTrakt: false,
  showExplanations: true,
  enableAnimations: true,
};
