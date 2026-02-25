import { useState } from 'react'
import '../App.css'
// import type { QuizQuestion } from '@shared/index'

interface AnswerScreenProps {
  /** La question en cours (sans correctIndex) */
  question: any // Remplace Omit<QuizQuestion, 'correctIndex'> pour le moment
  /** Temps restant en secondes */
  remaining: number
  /** Callback quand le joueur clique sur un choix */
  onAnswer: (choiceIndex: number) => void
  /** Si true, le joueur a deja repondu */
  hasAnswered: boolean
}

function AnswerScreen({ question, remaining, onAnswer, hasAnswered }: AnswerScreenProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const testQuestion = {
    id: '1',
    text: 'Quelle est la capitale de la France ?',
    choices: ['Londres', 'Paris', 'Berlin', 'Madrid']
  }

  const displayQuestion = question || testQuestion
  const displayRemaining = remaining || 15

  const handleClick = (index: number) => {
    if (hasAnswered) return
    setSelectedIndex(index)
    onAnswer(index)
  }

  const getTimerClass = () => {
    let classes = 'answer-timer'
    if (displayRemaining <= 3) classes += ' danger'
    else if (displayRemaining <= 10) classes += ' warning'
    return classes
  }

  return (
    <div className="answer-screen">
      <div className={getTimerClass()}>
        {displayRemaining}s
      </div>

      <h2 className="answer-question">{displayQuestion.text}</h2>

      <div className="answer-grid">
        {displayQuestion.choices.map((choice: string, index: number) => (
          <button
            key={index}
            className={`answer-btn ${selectedIndex === index ? 'selected' : ''}`}
            onClick={() => handleClick(index)}
            disabled={hasAnswered}
          >
            {choice}
          </button>
        ))}
      </div>

      {hasAnswered && (
        <div className="answered-message">
          Réponse envoyée !
        </div>
      )}
    </div>
  )
}

export default AnswerScreen