import { Directive, ElementRef, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  fromEvent,
  interval,
  map,
  merge,
  Observable,
  switchMap,
  takeUntil,
  takeWhile,
  tap,
} from 'rxjs';

@Directive({
  selector: '[appHoldable]',
})
export class HoldableDirective {
  /** Длительность удержания кнопки в миллисекундах */
  readonly holdTime = input<number>(1000);

  /** Прогресс удержания от 0 до 100 */
  readonly holdProgress = output<number>();

  /** Событие успешного завершения удержания */
  readonly holdTimeEnd = output<void>();

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  private pointerdown$: Observable<Event> = new Observable<Event>();
  private cancel$: Observable<Event> = new Observable<Event>();

  constructor() {
    this.pointerdown$ = fromEvent(this.el.nativeElement, 'mousedown');
    this.cancel$ = merge(
      fromEvent(this.el.nativeElement, 'pointerup'),
      fromEvent(this.el.nativeElement, 'pointerleave'),
      fromEvent(this.el.nativeElement, 'pointercancel'),
    );

    const cancelWithTap$ = this.cancel$.pipe(
      tap(() => this.holdProgress.emit(0)),
    );

    this.pointerdown$
      .pipe(
        switchMap(() =>
          interval(20).pipe(
            takeUntil(cancelWithTap$),
            map((tick) => (((tick + 1) * 20) / this.holdTime()) * 100),
            takeWhile((persent) => persent < 100, true),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((persent) => {
        this.holdProgress.emit(Math.min(persent));
        if (persent >= 100) {
          this.holdTimeEnd.emit();
        }
      });
  }

  // TODO: Шаг 1 — Создайте потоки начала удержания (pointerdown / mousedown)
  //               и отмены удержания (pointerup, pointerleave, pointercancel).
  // TODO: Шаг 2 — По клику запускайте таймер (interval) через switchMap и
  //               останавливайте его при событии отмены (takeUntil).
  // TODO: Шаг 3 — Пересчитывайте прошедшее время в процент [0..100], эмитьте
  //               его в holdProgress (при отмене сбрасывайте в 0), а при
  //               достижении 100% вызывайте holdTimeEnd.emit().
}
