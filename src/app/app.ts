import {
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
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

type QuoteType = 'double' | 'single';

const QUOTE_BY_TYPE: Record<QuoteType, string> = {
  double: '"',
  single: "'",
};
const EDITOR_VISIBLE_ROWS = 16;
const EDITOR_LINE_HEIGHT = 23;
const EDITOR_VERTICAL_PADDING = 12;
const GUTTER_RENDER_BUFFER = 6;
const MAX_REPORTED_ROW_NUMBERS = 200;

type TextStats = {
  rows: number;
  characters: number;
  words: number;
};

type InputInsights = {
  blankLines: number;
  blankLineRows: number[];
  blankLineOverflow: number;
  duplicateRows: number;
  whitespaceRows: number[];
  whitespaceOverflow: number;
  whitespaceRowCount: number;
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
  private readonly inputTextarea = viewChild<ElementRef<HTMLTextAreaElement>>('inputTextarea');

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
    const inputText = this.inputText();

    if (!inputText) {
      return '';
    }

    const quote = QUOTE_BY_TYPE[this.quoteType()];
    const rows = inputText.split(/\r?\n/);
    const addCommas = this.addCommas();
    const omitLastComma = this.omitLastComma();
    const formattedRows = new Array<string>(rows.length);

    for (let index = 0; index < rows.length; index += 1) {
      const formatted = `${quote}${rows[index]}${quote}`;
      const shouldAddComma = addCommas && (!omitLastComma || index < rows.length - 1);

      formattedRows[index] = shouldAddComma ? `${formatted},` : formatted;
    }

    return formattedRows.join('\n');
  });

  protected readonly inputStats = computed(() => this.getStats(this.inputText()));
  protected readonly resultStats = computed(() => this.getStats(this.resultText()));
  protected readonly inputInsights = computed(() => this.getInputInsights());
  protected readonly inputLineNumbers = computed(() =>
    this.getVisibleLineNumbers(this.inputStats().rows, this.inputScrollTop()),
  );
  protected readonly resultLineNumbers = computed(() =>
    this.getVisibleLineNumbers(this.resultStats().rows, this.resultScrollTop()),
  );
  protected readonly inputGutterOffset = computed(() =>
    this.getGutterOffset(this.inputLineNumbers()[0] ?? 1, this.inputScrollTop()),
  );
  protected readonly resultGutterOffset = computed(() =>
    this.getGutterOffset(this.resultLineNumbers()[0] ?? 1, this.resultScrollTop()),
  );

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
      if (!navigator.clipboard?.readText) {
        throw new Error('Clipboard API unavailable.');
      }

      const text = await navigator.clipboard?.readText();
      this.inputText.set(text ?? '');
    } catch {
      this.inputTextarea()?.nativeElement.focus();
      this.showMessage('Browser blocked clipboard access. The input is focused; press Cmd+V to paste.');
    }
  }

  protected setInputScroll(event: Event): void {
    this.inputScrollTop.set((event.target as HTMLTextAreaElement).scrollTop);
  }

  protected setInputText(event: Event): void {
    this.inputText.set((event.target as HTMLTextAreaElement).value);
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
    const rowsWithWhitespace = this.getInputInsights().whitespaceRowCount;

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

  protected removeEmptyRows(): void {
    let removedRows = 0;

    this.inputText.update((value) =>
      value
        .split(/\r?\n/)
        .filter((row) => {
          if (!row.trim()) {
            removedRows += 1;
            return false;
          }

          return true;
        })
        .join('\n'),
    );

    this.showMessage(
      removedRows
        ? `Removed ${removedRows} empty row${removedRows === 1 ? '' : 's'}.`
        : 'No empty rows found.',
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

  protected getOverflowLabel(count: number): string {
    return `+ ${count.toLocaleString()} more`;
  }

  private getInputInsights(): InputInsights {
    const rows = this.inputText().split(/\r?\n/);
    const seen = new Map<string, number>();
    const blankLineRows: number[] = [];
    const whitespaceRows: number[] = [];
    let blankLines = 0;
    let blankLineOverflow = 0;
    let duplicateRows = 0;
    let whitespaceOverflow = 0;
    let whitespaceRowCount = 0;

    rows.forEach((row, index) => {
      const trimmed = row.trim();

      if (!trimmed) {
        if (row.length > 0 || rows.length > 1) {
          blankLines += 1;
          if (blankLineRows.length < MAX_REPORTED_ROW_NUMBERS) {
            blankLineRows.push(index + 1);
          } else {
            blankLineOverflow += 1;
          }
        }
        return;
      }

      if (row !== trimmed) {
        whitespaceRowCount += 1;
        if (whitespaceRows.length < MAX_REPORTED_ROW_NUMBERS) {
          whitespaceRows.push(index + 1);
        } else {
          whitespaceOverflow += 1;
        }
      }

      const previousCount = seen.get(trimmed) ?? 0;
      if (previousCount > 0) {
        duplicateRows += 1;
      }
      seen.set(trimmed, previousCount + 1);
    });

    return {
      blankLines,
      blankLineRows,
      blankLineOverflow,
      duplicateRows,
      whitespaceRows,
      whitespaceOverflow,
      whitespaceRowCount,
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

  private getVisibleLineNumbers(lineCount: number, scrollTop: number): number[] {
    const totalRows = Math.max(EDITOR_VISIBLE_ROWS, lineCount || 1);
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / EDITOR_LINE_HEIGHT) - GUTTER_RENDER_BUFFER,
    );
    const visibleCount = EDITOR_VISIBLE_ROWS + GUTTER_RENDER_BUFFER * 2 + 2;
    const endIndex = Math.min(totalRows, startIndex + visibleCount);

    return Array.from({ length: endIndex - startIndex }, (_, index) => startIndex + index + 1);
  }

  private getGutterOffset(firstLineNumber: number, scrollTop: number): number {
    return (
      EDITOR_VERTICAL_PADDING +
      (firstLineNumber - 1) * EDITOR_LINE_HEIGHT -
      scrollTop
    );
  }

  private getStats(value: string): TextStats {
    if (!value.length) {
      return {
        rows: 0,
        characters: 0,
        words: 0,
      };
    }

    let rows = 1;
    let words = 0;
    let isInWord = false;

    for (let index = 0; index < value.length; index += 1) {
      const code = value.charCodeAt(index);
      const isLineBreak = code === 10 || code === 13;
      const isWhitespace = code <= 32;

      if (isLineBreak) {
        rows += 1;
        if (code === 13 && value.charCodeAt(index + 1) === 10) {
          index += 1;
        }
      }

      if (isWhitespace) {
        isInWord = false;
      } else if (!isInWord) {
        words += 1;
        isInWord = true;
      }
    }

    return {
      rows,
      characters: value.length,
      words,
    };
  }
}
