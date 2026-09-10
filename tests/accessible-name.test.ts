import { computeAccessibleName } from '../src/engine/accessible-name';

function el(html: string): Element {
  document.body.innerHTML = html;
  return document.body.firstElementChild!;
}

describe('accessible name', () => {
  it('uses aria-label', () => {
    const node = el('<button aria-label="Shopping cart"></button>');
    expect(computeAccessibleName(node)).toEqual({ name: 'Shopping cart', source: 'aria-label' });
  });

  it('follows aria-labelledby', () => {
    document.body.innerHTML =
      '<button aria-labelledby="cart-label"><svg></svg></button><span id="cart-label">View cart</span>';
    const node = document.querySelector('button')!;
    const result = computeAccessibleName(node);
    expect(result.name).toBe('View cart');
    expect(result.source).toContain('aria-labelledby');
  });

  it('uses associated label', () => {
    document.body.innerHTML = '<label for="email">Email</label><input id="email">';
    const node = document.querySelector('input')!;
    expect(computeAccessibleName(node).name).toBe('Email');
  });
});
