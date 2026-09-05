import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nProvider } from '@lingui/react';
import App from './App';
import { i18n, initialLocale } from './i18n';
import { messages as messagesDe } from './locales/de/messages.po';
import { messages as messagesFr } from './locales/fr/messages.po';
import { messages as messagesEn } from './locales/en/messages.po';
import '../css/vendor/bootstrap.min.css';
import '../css/style.css';

i18n.load('de', messagesDe);
i18n.load('fr', messagesFr);
i18n.load('en', messagesEn);

const locale = initialLocale();
i18n.activate(locale);
document.documentElement.lang = locale;

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <I18nProvider i18n={i18n}>
      <App />
    </I18nProvider>
  </StrictMode>
);