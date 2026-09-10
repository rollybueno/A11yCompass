import { startContentRuntime } from '../content/runtime';

export default defineContentScript({
  matches: ['http://*/*', 'https://*/*', 'file://*/*'],
  runAt: 'document_idle',
  main() {
    startContentRuntime();
  },
});
