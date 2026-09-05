import { useLingui } from '@lingui/react';
import { setLocale, type Locale } from '../i18n';

const OPTIONS: { value: Locale; label: string }[] = [
  { value: 'de', label: 'DE' },
  { value: 'fr', label: 'FR' },
  { value: 'en', label: 'EN' }
];

export function LanguageSwitcher() {
  const { i18n } = useLingui();

  return (
    <div className="lang-switch" role="group" aria-label="Language">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={i18n.locale === option.value ? 'active' : ''}
          aria-pressed={i18n.locale === option.value}
          onClick={() => setLocale(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}