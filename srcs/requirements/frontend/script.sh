#!/bin/bash

# Générer le composant Angular
ng generate component leaderboard

# Remplacer les fichiers générés par le code personnalisé
echo '<div class="leaderboard-container">
  <div class="best-players">
    <h2>Top 10 des Joueurs</h2>
    <ul>
      <li *ngFor="let player of topPlayers">
        {{ player.name }}: {{ player.score }}
      </li>
    </ul>
  </div>
  <div class="user-stats">
    <h2>Statistiques de l utilisateur</h2>
    <p>Nom: {{ currentUser.name }}</p>
    <p>Score: {{ currentUser.score }}</p>
  </div>
</div>' > src/app/leaderboard/leaderboard.component.html

echo '.leaderboard-container {
  display: flex;
  justify-content: space-between;
}

.best-players, .user-stats {
  width: 45%;
}

.best-players ul {
  list-style-type: none;
  padding: 0;
}' > src/app/leaderboard/leaderboard.component.css

echo "import { Component, OnInit } from '@angular/core';

interface Player {
  name: string;
  score: number;
}

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {
  topPlayers: Player[] = [
    { name: 'Alice', score: 900 },
    { name: 'Bob', score: 850 },
    // ... (plus d'objets Player ici)
  ];

  currentUser: Player = { name: 'You', score: 780 }; // À remplacer par les données du joueur courant

  constructor() { }

  ngOnInit(): void {
    // Vous pourriez ajouter ici du code pour récupérer les données depuis un serveur
  }

}" > src/app/leaderboard/leaderboard.component.ts

# Vous pouvez également remplacer le fichier spec.ts de la même manière

