import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { requestPageAccess } from '../../shared/host-access';
import '../sidepanel/styles.css';

function Popup() {
  return (
    <main className="sheet" style={{ width: 320, padding: 20 }}>
      <header className="brand" style={{ marginBottom: 16 }}>
        <img
          className="compass"
          src={chrome.runtime.getURL('icons/icon-48.png')}
          alt=""
          width={28}
          height={28}
          aria-hidden="true"
        />
        <div>
          <p className="product">A11yCompass</p>
          <p className="host">Guided accessibility review</p>
        </div>
      </header>
      <p>
        Open the side panel to survey this page. Automated checks stay separate from manual review. Nothing is uploaded.
      </p>
      <button
        type="button"
        className="primary"
        onClick={() => {
          void (async () => {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab?.id) return;
            try {
              if (tab.url) await requestPageAccess(tab.url);
              await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['page-audit.js'],
              });
            } catch {
              /* Restricted pages and denied access are explained in the side panel. */
            }
            await chrome.sidePanel.setOptions({ enabled: false });
            await chrome.sidePanel.setOptions({
              tabId: tab.id,
              path: 'sidepanel.html',
              enabled: true,
            });
            await chrome.sidePanel.open({ tabId: tab.id });
            window.close();
          })();
        }}
      >
        Open review panel
      </button>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Popup />
  </StrictMode>,
);
