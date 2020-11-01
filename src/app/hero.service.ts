import {Inject, Injectable, LOCALE_ID} from '@angular/core';
import {Hero} from './hero';
import {Observable, of} from 'rxjs';
import {MessageService} from './message.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, map, tap} from 'rxjs/operators';
import {formatDate} from '@angular/common';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable({
  providedIn: 'root'
})
export class HeroService {
  constructor(
    @Inject(LOCALE_ID) private locale: string,
    private httpClient: HttpClient,
    private messageService: MessageService) {
  }

  private heroesUrl = `api/heroes`;

  /**
   * Heroのリストを取得します。
   * @return Observable
   */
  getHeroes(): Observable<Hero[]> {
    return this.httpClient.get<Hero[]>(this.heroesUrl)
      .pipe(
        tap(heroes => this.log('getHeroes')),
        catchError(this.handleError<Hero[]>('getHeroes', []))
      );
  }

  put<T>(obj : T) {
    sessionStorage.setItem('key', JSON.stringify(obj));
  }

  /**
   * Heroを取得します。
   * @param id id
   * @returns Observable
   */
  getHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;
    return this.httpClient.get<Hero>(url)
      .pipe( tap(x => sessionStorage.setItem('hero', JSON.stringify(x))))
      .pipe(
        tap(_ => this.log(`getHero id=${id}`)),
        catchError(this.handleError<Hero>(`getHero id=${id}`))
      );
  }

  /**
   * ログ出力を行います。
   * @param message ログ文字列
   */
  private log(message: string) {
    const now = new Date();
    this.messageService.add(`${formatDate(now, 'yyyy/MM/dd HH:mm:ss', this.locale)} 処理実行 HeroService: ${message}`);
  }

  /**
   * エラーハンドラ。
   * @param operation メソッド名
   * @param result result
   * @returns (err: any) => Observable<T>
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (err: any): Observable<T> => {
      // TODO ログ基盤へのエラー出力
      console.error(err);

      // TODO エラー変換処理の改善
      this.log(`${operation} failed: ${err.message}`);

      // 空の結果を返却しアプリを持続可能にする
      return of(result as T);
    };
  }

  /**
   * Heroを更新します。
   * @param hero Hero
   * @returns Observable
   */
  updateHero(hero: Hero): Observable<any> {
    return this.httpClient.put(this.heroesUrl, hero, httpOptions)
      .pipe(
        tap(_ => this.log(`updateHero id=${hero.id}`)),
        catchError(this.handleError<any>('updateHero'))
      );
  }

  /**
   * Heroを追加します。
   * @param hero Hero
   * @returns Observable
   */
  addHero(hero: Hero): Observable<Hero> {
    return this.httpClient.post<Hero>(this.heroesUrl, hero, httpOptions).pipe(
      tap((newHero: Hero) => this.log(`addHero id=${newHero.id}`)),
      catchError(this.handleError<Hero>('addHero'))
    );
  }

  /**
   * Heroを削除します。
   * @param hero Hero
   * @returns Observable
   */
  deleteHero(hero: Hero | number): Observable<Hero> {
    const id = typeof hero === 'number' ? hero : hero.id;
    const url = `${this.heroesUrl}/${id}`;

    return this.httpClient.delete<Hero>(url, httpOptions).pipe(
      tap(_ => this.log(`deleteHero id=${id}`)),
      catchError(this.handleError<Hero>('deleteHero'))
    );
  }

  /**
   * Heroを検索します。
   * @param term 検索キーワード
   * @returns Observable
   */
  searchHeroes(term: string): Observable<Hero[]> {
    // 検索語が無い場合、空の配列を返却する
    if (!term.trim()) {
      return of([]);
    }

    return this.httpClient.get<Hero[]>(`${this.heroesUrl}/?name=${term}`).pipe(
      tap(_ => this.log(`searchHeroes "${term}"`)),
      catchError(this.handleError<Hero[]>('searchHeroes', []))
    );
  }
}
