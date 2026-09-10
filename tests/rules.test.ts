import { collectAuditContext } from '../src/engine/collect-context';
import { runAudit } from '../src/engine/run-audit';

function page(html: string): Document {
  const parsed = new DOMParser().parseFromString(
    `<!doctype html><html lang="en"><head><title>Fixture</title></head><body>${html}</body></html>`,
    'text/html',
  );
  return parsed;
}

async function idsFor(html: string, extra = '') {
  const doc = page(html);
  if (extra === 'no-lang') doc.documentElement.removeAttribute('lang');
  if (extra === 'no-title') doc.title = '';
  const context = collectAuditContext(doc);
  const results = await runAudit(context, { runContrast: false });
  return results.map((r) => r.ruleId);
}

describe('image rules', () => {
  it('flags img without alt as error, not empty alt', async () => {
    const missing = await idsFor('<img src="team.jpg">');
    expect(missing).toContain('image-alt-missing');

    const empty = await idsFor('<img src="divider.svg" alt="">');
    expect(empty).not.toContain('image-alt-missing');
    expect(empty).toContain('image-alt-empty-review');

    const ok = await idsFor('<img src="team.jpg" alt="Team photo">');
    expect(ok).not.toContain('image-alt-missing');
  });

  it('reviews filename-like alt text', async () => {
    const ids = await idsFor('<img src="x.jpg" alt="banner.jpg">');
    expect(ids).toContain('image-alt-filename');
  });
});

describe('name rules', () => {
  it('flags unnamed buttons and named ones pass', async () => {
    const missing = await idsFor('<button><svg></svg></button>');
    expect(missing).toContain('button-name-missing');

    const named = await idsFor('<button aria-label="Shopping cart"><svg></svg></button>');
    expect(named).not.toContain('button-name-missing');
  });

  it('computes labelledby names for form controls', async () => {
    const ids = await idsFor(
      '<span id="email-label">Email</span><input id="email" aria-labelledby="email-label">',
    );
    expect(ids).not.toContain('form-control-name-missing');
  });

  it('flags placeholder-only labels as warnings', async () => {
    const ids = await idsFor('<input type="email" placeholder="Email address">');
    expect(ids).toContain('placeholder-only-label-review');
    expect(ids).not.toContain('form-control-name-missing');
  });
});

describe('aria and keyboard', () => {
  it('flags focusable content in aria-hidden', async () => {
    const ids = await idsFor('<div aria-hidden="true"><button>Subscribe</button></div>');
    expect(ids).toContain('aria-hidden-focusable');
  });

  it('flags positive tabindex', async () => {
    const ids = await idsFor('<button tabindex="5">Go</button>');
    expect(ids).toContain('positive-tabindex');
  });
});

describe('document and headings', () => {
  it('flags missing lang and title', async () => {
    const lang = await idsFor('<h1>Hi</h1><main>x</main>', 'no-lang');
    expect(lang).toContain('html-lang-missing');
    const title = await idsFor('<h1>Hi</h1><main>x</main>', 'no-title');
    expect(title).toContain('document-title-missing');
  });

  it('reviews heading level jumps', async () => {
    const ids = await idsFor('<h1>Guide</h1><h3>Keyboard</h3><main>x</main>');
    expect(ids).toContain('heading-level-jump');
  });

  it('flags duplicate ids', async () => {
    const ids = await idsFor('<div id="dup"></div><span id="dup"></span><main>x</main>');
    expect(ids).toContain('duplicate-id');
  });
});
