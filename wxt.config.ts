import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: 'src',
  outDir: '.output',
  manifest: {
    name: 'A11yCompass',
    description:
      'Review web accessibility with automated checks, guided manual testing, DOM inspection, and keyboard tools.',
    version: '1.0.0',
    permissions: ['activeTab', 'scripting', 'storage', 'sidePanel'],
    host_permissions: ['http://*/*', 'https://*/*', 'file://*/*'],
    action: {
      default_title: 'Open A11yCompass',
      default_icon: {
        16: 'icons/icon-16.png',
        32: 'icons/icon-32.png',
        48: 'icons/icon-48.png',
        128: 'icons/icon-128.png',
      },
    },
    icons: {
      16: 'icons/icon-16.png',
      32: 'icons/icon-32.png',
      48: 'icons/icon-48.png',
      128: 'icons/icon-128.png',
    },
  },
  hooks: {
    'build:manifestGenerated': (_wxt, manifest) => {
      delete manifest.side_panel;
    },
  },
});
