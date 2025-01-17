import * as qs from 'querystring';

import {Injectable} from '@angular/core';
import {LoginToken} from '../shared/interfaces/token.interface';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {UrlTree, Router} from '@angular/router';

import {LoginInfo} from '../shared/interfaces/login-info.interface';
import {TokenService} from '../shared/token.service';
import {UserProfile} from '../shared/interfaces/user-profile.interface';
import {profileUrl, getTokenUrl} from '../shared/api-urls';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient,
    public router: Router,
    private tokenService: TokenService,
  ) {}

  private _defaultRedirectUrl: string = '/home';
  public isLoggedIn = false;

  /**
   * * 存储URL，以便我们在登录后可以重定向
   * * 默认重定向到 `/home`
   */
  private _redirectUrl: string | UrlTree;

  get redirectUrl(): string | UrlTree {
    return this._redirectUrl
      ? this.router.parseUrl(this._redirectUrl as string)
      : this._defaultRedirectUrl;
  }

  set redirectUrl(url: string | UrlTree) {
    this._redirectUrl = url;
  }

  async login(body: LoginInfo): Promise<boolean> {
    const r = await this.http
      .post<LoginToken>(getTokenUrl, qs.stringify(body), {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
      })
      .toPromise();

    if (r.data && r.data.token) {
      this.tokenService.setToken(r.data.token);
      this.isLoggedIn = true;
      return true;
    }

    this.isLoggedIn = false;
    return false;
  }

  logout(): void {
    this.isLoggedIn = false;
  }

  /**
   * * 获取用户的信息
   */
  async profile(): Promise<HttpResponse<UserProfile>> {
    return this.http
      .post<UserProfile>(profileUrl, null, {
        headers: {
          Authorization: `${await this.tokenService.token}`,
        },
        observe: 'response',
      })
      .toPromise();
  }
}
