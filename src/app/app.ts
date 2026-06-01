import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

type QuoteType = 'double' | 'single' | 'backtick';

const QUOTE_BY_TYPE: Record<QuoteType, string> = {
  double: '"',
  single: "'",
  backtick: '`',
};

@Component({
  selector: 'app-root',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSnackBarModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly snackBar = inject(MatSnackBar);

  protected readonly inputText = signal('');
  protected readonly quoteType = signal<QuoteType>('double');
  protected readonly addCommas = signal(true);
  protected readonly omitLastComma = signal(true);
  protected readonly copied = signal(false);
  protected readonly isNavHidden = signal(false);
  protected readonly inputScrollTop = signal(0);
  protected readonly resultScrollTop = signal(0);

  private lastScrollY = 0;
  private copiedTimer: ReturnType<typeof setTimeout> | undefined;

  protected readonly resultText = computed(() => {
    if (!this.inputText()) {
      return '';
    }

    const quote = QUOTE_BY_TYPE[this.quoteType()];

    return this.inputText()
      .split(/\r?\n/)
      .map((row, index, rows) => {
        const formatted = `${quote}${row}${quote}`;
        const shouldAddComma =
          this.addCommas() && (!this.omitLastComma() || index < rows.length - 1);

        return shouldAddComma ? `${formatted},` : formatted;
      })
      .join('\n');
  });

  protected readonly inputStats = computed(() => this.getStats(this.inputText()));
  protected readonly resultStats = computed(() => this.getStats(this.resultText()));
  protected readonly inputInsights = computed(() => this.getInputInsights());
  protected readonly inputLineNumbers = computed(() => this.getLineNumbers(this.inputText()));
  protected readonly resultLineNumbers = computed(() => this.getLineNumbers(this.resultText()));

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    const currentScrollY = Math.max(window.scrollY, 0);
    const hasMovedEnough = Math.abs(currentScrollY - this.lastScrollY) > 6;

    if (hasMovedEnough) {
      this.isNavHidden.set(currentScrollY > this.lastScrollY && currentScrollY > 96);
      this.lastScrollY = currentScrollY;
    }
  }

  protected async pasteInput(): Promise<void> {
    try {
      const text = await navigator.clipboard?.readText();
      this.inputText.set(text ?? '');
    } catch {
      this.showMessage('Browser blocked clipboard access. Click inside the input and use Cmd+V.');
    }
  }

  protected setInputScroll(event: Event): void {
    this.inputScrollTop.set((event.target as HTMLTextAreaElement).scrollTop);
  }

  protected setResultScroll(event: Event): void {
    this.resultScrollTop.set((event.target as HTMLTextAreaElement).scrollTop);
  }

  protected clearInput(): void {
    this.inputText.set('');
  }

  protected removeQuotesAndCommas(): void {
    this.inputText.update((value) => value.replace(/[,"'`]/g, ''));
  }

  protected trimRows(): void {
    const rowsWithWhitespace = this.getInputInsights().whitespaceRows.length;

    this.inputText.update((value) =>
      value
        .split(/\r?\n/)
        .map((row) => row.trim())
        .join('\n'),
    );

    this.showMessage(
      rowsWithWhitespace
        ? `Cleared leading/trailing whitespace from ${rowsWithWhitespace} row${rowsWithWhitespace === 1 ? '' : 's'}.`
        : 'No leading or trailing whitespace found.',
    );
  }

  protected deduplicateRows(): void {
    const seen = new Set<string>();
    let removedRows = 0;

    this.inputText.update((value) =>
      value
        .split(/\r?\n/)
        .filter((row) => {
          const key = row.trim();

          if (!key) {
            return true;
          }

          if (seen.has(key)) {
            removedRows += 1;
            return false;
          }

          seen.add(key);
          return true;
        })
        .join('\n'),
    );

    this.showMessage(
      removedRows
        ? `Removed ${removedRows} duplicate row${removedRows === 1 ? '' : 's'}.`
        : 'No duplicate rows found.',
    );
  }

  protected sortRows(): void {
    this.inputText.update((value) =>
      value
        .split(/\r?\n/)
        .sort((first, second) => first.trim().localeCompare(second.trim()))
        .join('\n'),
    );
  }

  protected async copyResult(): Promise<void> {
    await navigator.clipboard?.writeText(this.resultText());
    this.copied.set(true);

    if (this.copiedTimer) {
      clearTimeout(this.copiedTimer);
    }

    this.copiedTimer = setTimeout(() => this.copied.set(false), 1400);
  }

  private getInputInsights(): {
    blankLines: number;
    duplicateRows: number;
    whitespaceRows: number[];
  } {
    const rows = this.inputText().split(/\r?\n/);
    const seen = new Map<string, number>();
    const whitespaceRows: number[] = [];
    let blankLines = 0;
    let duplicateRows = 0;

    rows.forEach((row, index) => {
      const trimmed = row.trim();

      if (!trimmed) {
        if (row.length > 0 || rows.length > 1) {
          blankLines += 1;
        }
        return;
      }

      if (row !== trimmed) {
        whitespaceRows.push(index + 1);
      }

      const previousCount = seen.get(trimmed) ?? 0;
      if (previousCount > 0) {
        duplicateRows += 1;
      }
      seen.set(trimmed, previousCount + 1);
    });

    return {
      blankLines,
      duplicateRows,
      whitespaceRows,
    };
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: 3200,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['utility-snackbar'],
    });
  }

  private getLineNumbers(value: string): number[] {
    const visibleRows = 16;
    const lineCount = value ? value.split(/\r?\n/).length : 1;

    return Array.from({ length: Math.max(visibleRows, lineCount) }, (_, index) => index + 1);
  }

  private getStats(value: string): { rows: number; characters: number; words: number } {
    const trimmed = value.trim();

    return {
      rows: value.length ? value.split(/\r?\n/).length : 0,
      characters: value.length,
      words: trimmed ? trimmed.split(/\s+/).length : 0,
    };
  }
}
