import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    document.cookie = 'quoteOptions=; path=/; max-age=31536000';

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideNoopAnimations(), provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;

    expect(app).toBeTruthy();
    expect(app.quoteType()).toBe('single');
    expect(app.omitLastComma()).toBe(false);
  });

  it('should render the quote tool', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Add quotes to text');
  });

  it('keeps large inputs from rendering one gutter row per input row', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;

    app.inputText.set(Array.from({ length: 50_000 }, (_, index) => `row-${index}`).join('\n'));

    expect(app.inputStats().rows).toBe(50_000);
    expect(app.inputLineNumbers().length).toBeLessThan(40);
    expect(app.resultLineNumbers().length).toBeLessThan(40);
  });

  it('caps warning row chips while preserving total counts', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;

    app.inputText.set(Array.from({ length: 500 }, (_, index) => ` row-${index} `).join('\n'));

    const insights = app.inputInsights();
    expect(insights.whitespaceRowCount).toBe(500);
    expect(insights.whitespaceRows.length).toBe(200);
    expect(insights.whitespaceOverflow).toBe(300);
  });

  it('highlights the empty-row fix button until fixed', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;

    fixture.detectChanges();
    app.setInputText({ target: { value: 'alpha\n\nbravo' } } as unknown as Event);
    fixture.detectChanges();
    await fixture.whenStable();
    await Promise.resolve();

    const compiled = fixture.nativeElement as HTMLElement;
    const fixButton = compiled.querySelector(
      'button[aria-label="Fix empty rows warning: Remove empty rows"]',
    ) as HTMLButtonElement | null;

    expect(fixButton).toBeTruthy();
    expect(fixButton?.classList).toContain('action-button--pending-fix');

    app.removeEmptyRows();
    fixture.detectChanges();

    expect(app.inputText()).toBe('alpha\nbravo');
    expect(fixButton?.classList).not.toContain('action-button--pending-fix');
  });

  it('highlights quote cleanup while removable characters exist', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;

    fixture.detectChanges();
    app.setInputText({ target: { value: '"alpha",\n`bravo`' } } as unknown as Event);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const fixButton = compiled.querySelector(
      'button[aria-label="Fix quote or comma warning: Remove quotes/commas"]',
    ) as HTMLButtonElement | null;

    expect(fixButton).toBeTruthy();
    expect(fixButton?.classList).toContain('action-button--pending-fix');

    app.removeQuotesAndCommas();
    fixture.detectChanges();

    expect(app.inputText()).toBe('alpha\nbravo');
    expect(fixButton?.classList).not.toContain('action-button--pending-fix');
  });

  it('highlights duplicate cleanup while duplicate rows exist', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;

    fixture.detectChanges();
    app.setInputText({ target: { value: 'alpha\nbravo\n alpha ' } } as unknown as Event);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const fixButton = compiled.querySelector(
      'button[aria-label="Fix duplicate rows warning: Deduplicate rows"]',
    ) as HTMLButtonElement | null;

    expect(fixButton).toBeTruthy();
    expect(fixButton?.classList).toContain('action-button--pending-fix');

    app.deduplicateRows();
    fixture.detectChanges();

    expect(app.inputText()).toBe('alpha\nbravo');
    expect(fixButton?.classList).not.toContain('action-button--pending-fix');
  });

  it('remembers quote options in a cookie', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;

    app.quoteType.set('single');
    app.addCommas.set(false);
    app.omitLastComma.set(false);
    app.saveQuoteOptions();

    expect(document.cookie).toContain('quoteOptions=s00');
  });

  it('removes terminal line breaks from pasted quote input', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;

    app.setInputText({
      inputType: 'insertFromPaste',
      target: { value: 'alpha\nbravo\n' },
    } as unknown as Event);

    expect(app.inputText()).toBe('alpha\nbravo');
    expect(app.resultText()).toBe("'alpha',\n'bravo',");
  });

  it('generates an alternating-hand qwerty password by default', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;

    app.passwordStyle.set('random');
    app.smoothness.set(100);
    app.includeNumbers.set(false);
    app.includeSymbols.set(false);
    app.generatePassword();

    const password = app.generatedPassword();
    const rhythm = app.passwordRhythm();

    expect(password.length).toBe(18);
    expect(rhythm.length).toBe(18);

    for (let index = 1; index < rhythm.length; index += 1) {
      expect(rhythm[index]).not.toBe(rhythm[index - 1]);
    }
  });

  it('defaults to a passphrase ending with one symbol and one number', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;

    const password = app.generatedPassword();

    expect(app.passwordStyle()).toBe('passphrase');
    expect(app.includeLowercase()).toBe(true);
    expect(app.includeUppercase()).toBe(true);
    expect(app.includeNumbers()).toBe(true);
    expect(app.includeSymbols()).toBe(true);
    expect(app.alternateHands()).toBe(true);
    expect(app.avoidAmbiguous()).toBe(true);
    expect(app.avoidAwkwardKeys()).toBe(true);
    expect(app.smoothness()).toBe(80);
    expect(app.passphraseWordCount()).toBe(3);
    expect(app.passphraseJoin()).toBe('none');
    expect(app.capitalizationStyle()).toBe('camel');
    expect(app.endingPattern()).toBe('bangNumber');
    expect(app.numberCharacterCount()).toBe(1);
    expect(app.symbolCharacterCount()).toBe(1);
    expect(app.symbolPlacement()).toBe('end');
    expect(app.numberPlacement()).toBe('end');
    expect(password).toMatch(/[^a-z0-9][0-9]$/i);
  });

  it('can generate a smooth lowercase password', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;

    app.includeUppercase.set(false);
    app.includeNumbers.set(false);
    app.includeSymbols.set(false);
    app.passwordStyle.set('smooth');
    app.generatePassword();

    const password = app.generatedPassword();

    expect(password.length).toBe(18);
    expect(password).toMatch(/^[a-z]+$/);
    expect(password).toMatch(/[aeiuy]/);
    expect(password).toMatch(/[bcdfghjkmnpqrstvwxyz]/);
  });

  it('can generate a passphrase with exact number and symbol counts', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;

    app.passwordStyle.set('passphrase');
    app.endingPattern.set('custom');
    app.numberCharacterCount.set(3);
    app.symbolCharacterCount.set(2);
    app.generatePassword();

    const password = app.generatedPassword();

    expect(password).toMatch(/[a-z]{4,}/i);
    expect(password.match(/[0-9]/g)?.length).toBe(3);
    expect(password.match(/[^a-z0-9]/gi)?.length).toBe(2);
  });

  it('counts-only still adds selected numbers and symbols', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;

    app.passwordStyle.set('passphrase');
    app.endingPattern.set('none');
    app.numberCharacterCount.set(2);
    app.symbolCharacterCount.set(2);
    app.generatePassword();

    const password = app.generatedPassword();

    expect(password.match(/[0-9]/g)?.length).toBe(2);
    expect(password.match(/[^a-z0-9]/gi)?.length).toBe(2);
  });

  it('can place generated additions between passphrase words', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;

    app.passwordStyle.set('passphrase');
    app.passphraseJoin.set('hyphen');

    expect(app.insertDisruptionGroup('alpha-bravo', ['9'], 'betweenWords')).toBe('alpha9-bravo');
  });

  it('uses alternating-friendly words for passphrases when hand alternation is enabled', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;

    app.passwordStyle.set('passphrase');
    app.includeNumbers.set(false);
    app.includeSymbols.set(false);
    app.generatePassword();

    const rhythm = app.passwordRhythm();
    let sameHandTransitions = 0;

    for (let index = 1; index < rhythm.length; index += 1) {
      if (rhythm[index] === rhythm[index - 1]) {
        sameHandTransitions += 1;
      }
    }

    expect(sameHandTransitions / Math.max(rhythm.length - 1, 1)).toBeLessThanOrEqual(0.4);
  });

  it('can end with a symbol followed by one number', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;

    app.passwordStyle.set('passphrase');
    app.endingPattern.set('bangNumber');
    app.generatePassword();

    expect(app.generatedPassword()).toMatch(/![0-9]$/i);
  });

  it('supports passphrase max word count, join, and capitalization controls', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;

    app.passwordStyle.set('passphrase');
    app.includeNumbers.set(false);
    app.includeSymbols.set(false);
    app.passwordLength.set(24);
    app.passphraseWordCount.set(4);
    app.passphraseJoin.set('hyphen');
    app.capitalizationStyle.set('title');
    app.generatePassword();

    const words = app.generatedPassword().split('-');

    expect(words.length).toBeLessThanOrEqual(4);
    expect(words.length).toBeGreaterThanOrEqual(3);
    expect(words.every((word: string) => /^[A-Z][a-z]+$/.test(word))).toBe(true);
  });

  it('can generate themed passphrases from the selected theme bank', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;

    app.passwordStyle.set('themed');
    app.themedPassphraseTheme.set('starTrek');
    app.includeNumbers.set(false);
    app.includeSymbols.set(false);
    app.capitalizationStyle.set('lowercase');
    app.passphraseJoin.set('hyphen');
    app.passphraseWordCount.set(4);
    app.passwordLength.set(24);
    app.generatePassword();

    const wordBank = new Set(app.getPassphraseWordBank());
    const words = app.generatedPassword().split('-');

    expect(wordBank.has('enterprise')).toBe(true);
    expect(words.length).toBeGreaterThanOrEqual(3);
    expect(words.every((word: string) => wordBank.has(word))).toBe(true);
  });

  it('renders the themed password option and theme picker on the password route', async () => {
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;

    await router.navigateByUrl('/password-tool');
    app.passwordStyle.set('themed');
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Themed');
    expect(compiled.querySelector('select')?.textContent).toContain('Star Wars');
    expect(compiled.querySelector('select')?.textContent).toContain('IT');
  });

  it('uses password length as a passphrase target', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;

    app.passwordStyle.set('passphrase');
    app.includeNumbers.set(false);
    app.includeSymbols.set(false);
    app.passphraseWordCount.set(4);

    app.passwordLength.set(12);
    app.generatePassword();
    const shortPassword = app.generatedPassword();

    app.passwordLength.set(24);
    app.generatePassword();
    const longPassword = app.generatedPassword();

    expect(longPassword.length).toBeGreaterThan(shortPassword.length);
    expect(Math.abs(longPassword.length - 24)).toBeLessThanOrEqual(8);
  });

  it('has a large passphrase word bank and avoids immediate word reuse', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;

    expect(app.getFreshPassphraseWordBank(['one']).length).toBe(1);

    app.passwordStyle.set('passphrase');
    app.includeNumbers.set(false);
    app.includeSymbols.set(false);
    app.capitalizationStyle.set('lowercase');
    app.passphraseJoin.set('hyphen');
    app.passphraseWordCount.set(4);
    app.passwordLength.set(24);
    app.generatePassword();

    const firstWords = new Set(app.generatedPassword().split('-'));
    app.generatePassword();
    const secondWords = app.generatedPassword().split('-');

    expect(secondWords.some((word: string) => firstWords.has(word))).toBe(false);
  });
});
