import '../App.css'

interface WaitingLobbyProps {
    players: string[]
}

function WaitingLobby({ players }: WaitingLobbyProps) {
    console.log('[WaitingLobby] Rendu avec:', { players, playersLength: players?.length })

    // Protection contre les valeurs undefined/null
    const safePlayers = players || []

    return (
        <div className="waiting-container">
            <h1>En attente du host...</h1>
            <p className="waiting-message">Le quiz démarrera bientôt</p>

            <div className="player-count">
                {safePlayers.length} joueur{safePlayers.length > 1 ? 's' : ''} connecté{safePlayers.length > 1 ? 's' : ''}
            </div>

            <div className="player-list">
                {safePlayers.map((player, index) => (
                    <div key={`${player}-${index}`} className="player-chip">
                        {player}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default WaitingLobby