//File: frontend/src/app/app.ts

import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  protected readonly title = signal('frontend');


  isDark = signal(false);

  toggleDarkMode() {
    this.isDark.update(v => {
      const newValue = !v;
      document.documentElement.setAttribute('data-theme', newValue ? 'dark' : 'light');
      return newValue;
    });
  }
}
