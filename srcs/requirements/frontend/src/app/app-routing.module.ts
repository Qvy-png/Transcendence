import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { FriendsComponent } from './components/friends/FriendsComponent';
import { SettingsComponent } from './components/settings/settings.component';
import { PlayMenuComponent } from './components/play-menu/play-menu.component';
import { PlayComponent } from './components/play/play.component';
import { PageNotfoundComponent } from './components/page-notfound/page-notfound.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';

import { AuthGuard } from './services/auth.guard';
import { TwofaComponent } from './components/settings/twofa/twofa.component';
import { ChatItemComponent } from './components/friends/chat-item/chat-item.component';
import { TwoFaLogComponent } from './components/login-page/two-fa-log/two-fa-log.component';

const routes: Routes = [
  {path: 'login', component: LoginPageComponent},
  {path: 'twoFaLog', component: TwoFaLogComponent},
  {path: '', canActivate: [AuthGuard], children: [
    {path: '', redirectTo: 'main', pathMatch: 'full'},
    {path: 'main', component: MainMenuComponent},
    {path: 'profile', component: ProfileComponent},
    {path: 'play', component: PlayComponent},
    {path: 'play-menu', component: PlayMenuComponent},
    {path: 'friends', component: FriendsComponent},
    {path: 'settings', component: SettingsComponent},
    {path: 'twoFa', component: TwofaComponent},
    {path: 'leaderboard', component: LeaderboardComponent},
    {path: 'chat', component: ChatItemComponent},
    {path: '**', component: PageNotfoundComponent}
  ]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
