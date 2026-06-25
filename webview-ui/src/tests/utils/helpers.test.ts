import { describe, it, expect } from 'vitest';
import { escHtml, getCharStatus } from '../../utils/helpers';

describe('helpers', () => {
  it('escHtml deve escapar caracteres < e >', () => {
    expect(escHtml('<div>')).toBe('&lt;div&gt;');
  });

  it('getCharStatus deve retornar "ok" quando value >= goal', () => {
    expect(getCharStatus(10, 10)).toBe('ok');
    expect(getCharStatus(11, 10)).toBe('ok');
  });

  it('getCharStatus deve retornar "fail" quando value < 90% do goal', () => {
    expect(getCharStatus(8, 10)).toBe('fail');
    expect(getCharStatus(0, 10)).toBe('fail');
  });
});
