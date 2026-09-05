import type { LinguiConfig } from '@lingui/conf';
import { formatter } from '@lingui/format-po';

export default {
  locales: ['de', 'fr', 'en'],
  sourceLocale: 'en',
  fallbackLocales: { default: 'en' },
  catalogs: [
    {
      path: 'src/locales/{locale}/messages',
      include: ['src']
    }
  ],
  format: formatter({ lineNumbers: false })
} satisfies LinguiConfig;