import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { lingui } from '@lingui/vite-plugin';
import { giftRegistryDevApi } from './plugins/gift-registry-dev-api';

export default defineConfig({
  base: './',
  plugins: [
    react({
      babel: {
        plugins: ['@lingui/babel-plugin-lingui-macro']
      }
    }),
    lingui(),
    giftRegistryDevApi()
  ]
});