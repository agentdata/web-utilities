import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'quotes-tool' },
  { path: 'quotes-tool', children: [] },
  { path: 'diff-tool', children: [] },
  { path: 'password-tool', children: [] },
  { path: '**', redirectTo: 'quotes-tool' },
];
