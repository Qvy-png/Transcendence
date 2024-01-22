import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { FriendsComponent } from './components/friends/FriendsComponent';
import { SettingsComponent } from './components/settings/settings.component';
import { PlayMenuComponent } from './components/play-menu/play-menu.component';
import { PlayComponent } from './components/play/play.component';
import { SocketService } from './services/socket.service';
import { ButtonComponent } from './components/button/button.component';
import { HeaderComponent } from './components/header/header.component';
import { PageNotfoundComponent } from './components/page-notfound/page-notfound.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ButtonProfileComponent } from './components/button-profile/button-profile.component';
import { TokenInterceptor } from './services/interceptors/token.interceptor';
import { RequestItemComponent } from './components/friends/request-item/request-item.component';
import { FriendItemComponent } from './components/friends/friend-item/friend-item.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TwofaComponent } from './components/settings/twofa/twofa.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { HistoricItemComponent } from './components/profile/historic-item/historic-item.component';
import { RankerItemComponent } from './components/leaderboard/ranker-item/ranker-item.component';
import { GroupItemComponent } from './components/friends/group-item/group-item.component';
import { BlockItemComponent } from './components/friends/block-item/block-item.component';
import { ChatItemComponent } from './components/friends/chat-item/chat-item.component';
import { TwoFaLogComponent } from './components/login-page/two-fa-log/two-fa-log.component';

@NgModule({
  declarations: [
    AppComponent,
    MainMenuComponent,
    FriendsComponent,
    SettingsComponent,
    PlayMenuComponent,
    PlayComponent,
    ButtonComponent,
    HeaderComponent,
    PageNotfoundComponent,
    LoginPageComponent,
    ProfileComponent,
    ButtonProfileComponent,
    RequestItemComponent,
    FriendItemComponent,
    TwofaComponent,
    LeaderboardComponent,
    HistoricItemComponent,
    RankerItemComponent,
    GroupItemComponent,
    BlockItemComponent,
    ChatItemComponent,
    TwoFaLogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    FontAwesomeModule,
  ],
  providers: [
    SocketService,
    CookieService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
