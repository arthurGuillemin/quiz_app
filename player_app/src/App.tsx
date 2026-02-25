import { useState, useEffect } from 'react'
import { useWebSocket } from './hooks/useWebSocket'
import type {  QuizQuestion } from '../../packages/shared-types/index'
import JoinScreen from './components/JoinScreen'
import WaitingLobby from './components/WaitingLobby'
import AnswerScreen from './components/AnswerScreen'
import FeedbackScreen from './components/FeedbackScreen'
import ScoreScreen from './components/ScoreScreen'
import './App.css'

const WS_URL = 'https://75e5-185-226-32-80.ngrok-free.app/'

function App() {
  const { status, sendMessage, lastMessage } = useWebSocket(WS_URL)

  // --- Etats de l'application ---
  const [phase, setPhase] = useState<'join' | 'lobby' | 'question' | 'feedback' | 'results' | 'leaderboard' | 'ended'>('join')
  const [playerName, setPlayerName] = useState('')
  const [players, setPlayers] = useState<string[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null)
  const [remaining, setRemaining] = useState(0)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [playerAnswer, setPlayerAnswer] = useState<number | null>(null)
  const [lastCorrect, setLastCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [rankings, setRankings] = useState<{ name: string; score: number }[]>([])
  const [error, setError] = useState<string | undefined>(undefined)

  // --- Traitement des messages du serveur ---
  useEffect(() => {
    if (!lastMessage) return

    console.log('[Player App] Message reçu:', lastMessage)

    switch (lastMessage.type) {
      case 'joined': {
        console.log('[Player App] Joueurs reçus:', lastMessage.players)
        // Éviter les re-renders inutiles si les joueurs n'ont pas changé
        const newPlayers = lastMessage.players
        if (JSON.stringify(players) !== JSON.stringify(newPlayers)) {
          setPlayers(newPlayers)
        }
        setPhase('lobby')
        setError(undefined)
        break
      }

      case 'question': {
        // Ajouter correctIndex car il est omis dans le message
        const questionWithAnswer = {
          ...lastMessage.question,
          correctIndex: -1 // On ne connaît pas la réponse côté client
        } as QuizQuestion
        setCurrentQuestion(questionWithAnswer)
        setRemaining(lastMessage.question.timerSec)
        setHasAnswered(false)
        setPlayerAnswer(null)
        setPhase('question')
        break
      }

      case 'tick': {
        setRemaining(lastMessage.remaining)
        break
      }

      case 'results': {
        // Vérifier si le joueur a répondu correctement
        const correct = playerAnswer === lastMessage.correctIndex
        setLastCorrect(correct)

        // Récupérer le score du joueur
        const playerScore = lastMessage.scores[playerName] ?? 0
        setScore(playerScore)

        setPhase('feedback')
        break
      }

      case 'leaderboard': {
        setRankings(lastMessage.rankings)
        setPhase('leaderboard')
        break
      }

      case 'ended': {
        setPhase('ended')
        break
      }

      case 'error': {
        setError(lastMessage.message)
        break
      }
    }
  }, [lastMessage, playerName])

  // --- Handlers ---

  /** Appele quand le joueur soumet le formulaire de connexion */
  const handleJoin = (code: string, name: string) => {
    setPlayerName(name)
    setError(undefined)
    sendMessage({ type: 'join', quizCode: code, name })
  }

  /** Appele quand le joueur clique sur un choix de reponse */
  const handleAnswer = (choiceIndex: number) => {
    if (hasAnswered || !currentQuestion) return
    setHasAnswered(true)
    setPlayerAnswer(choiceIndex)
    sendMessage({ type: 'answer', questionId: currentQuestion.id, choiceIndex })
  }

  // --- Rendu par phase ---
  const renderPhase = () => {
    switch (phase) {
      case 'join':
        return <JoinScreen onJoin={handleJoin} error={error} />

      case 'lobby':
        return <WaitingLobby players={players} />

      case 'question':
        return (
          <AnswerScreen
            question={currentQuestion}
            remaining={remaining}
            onAnswer={handleAnswer}
            hasAnswered={hasAnswered}
          />
        )

      case 'feedback':
        return <FeedbackScreen correct={lastCorrect} score={score} />

      case 'results':
        // Pendant 'results' on reste sur FeedbackScreen
        return <FeedbackScreen correct={lastCorrect} score={score} />

      case 'leaderboard':
        return <ScoreScreen rankings={rankings} playerName={playerName} />

      case 'ended':
        return (
          <div className="phase-container">
            <h1>Quiz termine !</h1>
            <p className="ended-message">Merci d'avoir participe !</p>
            <button className="btn-primary" onClick={() => setPhase('join')}>
              Rejoindre un autre quiz
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h2>Quiz Player</h2>
        <span className={`status-badge status-${status}`}>
          {status === 'connected' ? 'Connecte' : status === 'connecting' ? 'Connexion...' : 'Deconnecte'}
        </span>
      </header>
      <main className="app-main">
        {renderPhase()}
      </main>
    </div>
  )
}

export default App
