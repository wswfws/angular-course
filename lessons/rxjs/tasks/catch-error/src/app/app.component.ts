import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subject, concatMap, map, catchError, of, filter } from 'rxjs';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-root',
  template: `
    <main class="page">
      <section class="card">
        <header class="card-header">
          <div class="header-top">
            <span class="badge">Задача 2 · Изоляция ошибок</span>
            <span
              class="stream-status"
              data-testid="stream-status"
              [class.status-alive]="streamStatus === 'alive'"
              [class.status-dead]="streamStatus !== 'alive'">
              {{
                streamStatus === 'alive'
                  ? '● Поток submit$ активен'
                  : '✕ Поток submit$ аварийно закрыт'
              }}
            </span>
          </div>
          <h1>Песочница API-запросов</h1>
          <p class="subtitle">
            Введите название ресурса JSONPlaceholder и нажмите
            <strong>Fetch</strong>. Попробуйте отправить несуществующий ресурс
            (например, <code>foo</code>), а затем снова запросить
            <code>posts</code>.
          </p>
        </header>

        <div class="presets">
          <span class="presets-label">Быстрый выбор:</span>
          @for (preset of presets; track preset) {
            <button
              type="button"
              class="chip"
              [class.chip-danger]="preset === 'foo'"
              (click)="selectPreset(preset)">
              {{ preset === 'foo' ? 'foo (404 Error)' : preset }}
            </button>
          }
        </div>

        <form class="form-container" (ngSubmit)="submit$.next()">
          <input
            type="text"
            placeholder="Например: posts, users, foo..."
            [(ngModel)]="input"
            name="action" />
          <button type="submit" class="submit-btn">Fetch</button>
        </form>

        <div class="response-section">
          <div class="response-header">
            <span>Ответ (<code>response</code>):</span>
            <span class="request-counter">
              Обработано ответов: <strong>{{ handledCount }}</strong>
            </span>
          </div>
          <pre class="response" data-testid="response-output">{{
            response ? (response | json) : 'Ожидание первого запроса...'
          }}</pre>
        </div>
      </section>
    </main>
  `,
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  submit$ = new Subject<void>();
  input = 'posts';
  response: unknown;
  streamStatus: 'alive' | 'errored' | 'completed' = 'alive';
  handledCount = 0;

  readonly presets = ['posts', 'comments', 'albums', 'users', 'foo'];

  private destroyRef = inject(DestroyRef);
  private http = inject(HttpClient);

  selectPreset(value: string) {
    this.input = value;
  }

  ngOnInit() {
    this.submit$
      .pipe(
        map(() => this.input),
        filter(value => Boolean(value.trim())),
        concatMap((value) =>
          this.http.get(`https://jsonplaceholder.typicode.com/${value}/1`).pipe(
            catchError((err) => {
              console.log(err);
              return of(err);
            })
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (value) => {
          console.log(value);
          this.handledCount++;
          this.response = value;
        },
        error: (error) => {
          console.log(error);
          this.streamStatus = 'errored';
          this.response = error;
        },
        complete: () => {
          console.log('done');
          this.streamStatus = 'completed';
        },
      });
  }
}
