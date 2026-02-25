import '../App.css'

interface ScoreScreenProps {
  /** Classement trie par score decroissant */
  rankings: { name: string; score: number }[]
  /** Nom du joueur actuel (pour le mettre en surbrillance) */
  playerName: string
}

/**
 * Composant affichant le classement avec la position du joueur en surbrillance.
 *
 * Ce qu'il faut implementer :
 * - Un titre "Classement" (classe .leaderboard-title)
 * - La liste ordonnee des joueurs (classe .leaderboard)
 * - Chaque joueur est dans un .leaderboard-item
 *   Si c'est le joueur actuel, ajouter aussi la classe .is-me
 * - Afficher pour chaque joueur :
 *   - Son rang (1, 2, 3...) dans .leaderboard-rank
 *   - Son nom dans .leaderboard-name
 *   - Son score dans .leaderboard-score
 *
 * Classes CSS disponibles : .score-screen, .leaderboard-title, .leaderboard,
 * .leaderboard-item, .is-me, .leaderboard-rank, .leaderboard-name, .leaderboard-score
 */
function ScoreScreen({ rankings, playerName }: ScoreScreenProps) {

  const testRankings = [
    { name: 'Alice', score: 2500 },
    { name: 'Bob', score: 2100 },
    { name: 'Charlie', score: 1800 },
    { name: 'David', score: 1500 },
    { name: 'Emma', score: 1200 },
    { name: 'Frank', score: 900 }
  ]

  const displayRankings = rankings.length > 0 ? rankings : testRankings
  const displayPlayerName = playerName || 'Charlie'

  return (
    <div className="score-screen">
      <h1 className="leaderboard-title">Classement</h1>

      <div className="leaderboard">
        {displayRankings.map((ranking, index) => (
          <div
            key={index}
            className={`leaderboard-item ${ranking.name === displayPlayerName ? 'is-me' : ''
              }`}
          >
            <div className="leaderboard-rank">#{index + 1}</div>
            <div className="leaderboard-name">{ranking.name}</div>
            <div className="leaderboard-score">{ranking.score} pts</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ScoreScreen