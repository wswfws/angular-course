import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { shareReplay, take } from 'rxjs';
import { TopicModalComponent } from './topic-dialog.component';
import { TopicService } from './topic.service';

@Component({
  selector: 'app-root',
  template: `
    <main class="page">
      <section class="card">
        <header class="card-header">
          <span class="badge">Задача 1 · Race Condition</span>
          <h1>Выбор тем подписки</h1>
          <p class="subtitle">
            Справочник тем загружается с сервера
            <strong>1000 мс</strong>
            . Если нажать кнопку сразу после открытия страницы, диалог откроется
            раньше, чем придут данные.
          </p>
        </header>

        <div class="telemetry">
          <div class="metric">
            <span class="metric-label">Статус API</span>
            <span
              class="metric-value"
              [class.status-loading]="topicService.isLoading()"
              [class.status-ready]="!topicService.isLoading()">
              {{
                topicService.isLoading()
                  ? 'Загрузка (1000 мс)...'
                  : 'Ожидание / Готово'
              }}
            </span>
          </div>

          <div class="metric">
            <span class="metric-label">HTTP-запросов отправлено</span>
            <span
              class="metric-value"
              data-testid="request-count"
              [class.status-warn]="topicService.requestCount() > 1">
              {{ topicService.requestCount() }}
            </span>
          </div>
        </div>

        <div class="actions">
          <button class="primary-btn" (click)="openTopicModal()">
            Open Topic
          </button>
        </div>

        <footer class="hint-box">
          <strong>Как проверить баг:</strong>
          обновите страницу (F5) и в первую же секунду нажмите
          <code>Open Topic</code>
          — список внутри модального окна окажется пустым.
        </footer>
      </section>
    </main>
  `,
  styles: [
    `
      .page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8fafc;
        padding: 24px;
        font-family:
          Inter,
          -apple-system,
          BlinkMacSystemFont,
          'Segoe UI',
          Roboto,
          sans-serif;
      }

      .card {
        width: 100%;
        max-width: 520px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 28px;
        box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.06);
      }

      .badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 999px;
        background: #e0e7ff;
        color: #4338ca;
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 12px;
      }

      h1 {
        margin: 0 0 8px;
        font-size: 22px;
        color: #0f172a;
      }

      .subtitle {
        margin: 0;
        color: #475569;
        font-size: 14px;
        line-height: 1.5;
      }

      .telemetry {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin: 20px 0;
      }

      .metric {
        padding: 12px 14px;
        border-radius: 12px;
        background: #f1f5f9;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .metric-label {
        font-size: 12px;
        color: #64748b;
      }

      .metric-value {
        font-size: 15px;
        font-weight: 700;
        color: #0f172a;
      }

      .status-loading {
        color: #d97706;
      }

      .status-ready {
        color: #059669;
      }

      .status-warn {
        color: #dc2626;
      }

      .actions {
        margin: 20px 0;
      }

      .primary-btn {
        width: 100%;
        padding: 12px 20px;
        border: none;
        border-radius: 10px;
        background: #4f46e5;
        color: #ffffff;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease;
      }

      .primary-btn:hover {
        background: #4338ca;
      }

      .hint-box {
        padding: 12px 14px;
        border-radius: 10px;
        background: #fffbeb;
        border: 1px solid #fde68a;
        color: #92400e;
        font-size: 13px;
        line-height: 1.5;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'rxjs-race-condition';
  dialog = inject(MatDialog);
  topicService = inject(TopicService);
  topics$ = this.topicService.fakeGetHttpTopic().pipe(
    take(1),
    shareReplay(1)
  );

  openTopicModal() {
    this.topics$.subscribe((topics) => {
      this.dialog.open(TopicModalComponent, {
        data: { topics },
      });
    });
  }
}
