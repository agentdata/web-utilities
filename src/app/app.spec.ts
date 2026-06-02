import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideNoopAnimations()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
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
});
