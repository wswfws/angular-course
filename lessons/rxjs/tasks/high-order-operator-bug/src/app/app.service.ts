import { inject, Injectable } from '@angular/core';
import { from, mergeMap, Observable, of, reduce } from 'rxjs';
import { LocalDBService, TopicType } from './localDB.service';

@Injectable({ providedIn: 'root' })
export class AppService {
  private dbService = inject(LocalDBService);

  getAllInfo = this.dbService.infos;

  deleteOldTopics(type: TopicType): Observable<boolean> {
    const infoByType = this.dbService.searchByType(type);
    return infoByType.length > 0
      ? from(infoByType).pipe(
          mergeMap((t) => this.dbService.deleteOneTopic(t.id)),
          reduce((acc, cur) => acc && cur, true),
        )
      : of(true);
  }
}
