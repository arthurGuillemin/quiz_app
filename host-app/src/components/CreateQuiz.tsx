// ============================================================
// CreateQuiz - Formulaire de creation d'un quiz
// A IMPLEMENTER : construire le formulaire dynamique
// ============================================================

import { useState } from 'react'
import type { QuizQuestion } from '@shared/index'

interface CreateQuizProps {
  /** Callback appele quand le formulaire est soumis */
  onSubmit: (title: string, questions: QuizQuestion[]) => void
}

/**
 * Composant formulaire pour creer un nouveau quiz.
 *
 * Ce qu'il faut implementer :
 * - Un champ pour le titre du quiz
 * - Une liste dynamique de questions (pouvoir en ajouter/supprimer)
 * - Pour chaque question :
 *   - Un champ texte pour la question
 *   - 4 champs texte pour les choix de reponse
 *   - Un selecteur (radio) pour la bonne reponse (correctIndex)
 *   - Un champ pour la duree du timer en secondes
 * - Un bouton pour ajouter une question
 * - Un bouton pour soumettre le formulaire
 *
 * Astuce : utilisez un state pour stocker un tableau de questions
 * et generez un id unique pour chaque question (ex: crypto.randomUUID())
 *
 * Classes CSS disponibles : .create-form, .form-group, .question-card,
 * .question-card-header, .choices-inputs, .choice-input-group,
 * .btn-add-question, .btn-remove, .btn-primary
 */

interface Question {
  id: string
  text: string
  choices: string[]
  correctIndex: number
  duration: number
}

function CreateQuiz({ onSubmit }: CreateQuizProps) {
  // TODO: State pour le titre
  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  // TODO: State pour la liste des questions
  const addQuestion = () => {
    const newQuestion: Question = {
        id: crypto.randomUUID(),
        text: '',
        choices: ['', '', '', ''],
        correctIndex: 0,
        duration: 30,
    }
    setQuestions(prev => [...prev, newQuestion])
  }

  const updateQuestion = (id: string, updated: Partial<Question>) => {
    setQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, ...updated } : q))
    )
  }

  const updateChoice = (id: string, index: number, value: string) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id !== id) return q
        const newChoices = [...q.choices]
        newChoices[index] = value
        return { ...q, choices: newChoices }
      })
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Valider que le titre n'est pas vide
    if (title.trim() === '') {
        alert('Le titre du quiz ne peut pas être vide.')
        return
    }
    // TODO: Valider qu'il y a au moins 1 question
    if (questions.length === 0) {
        alert('Vous devez ajouter au moins une question.')
        return
    }
    // TODO: Valider que chaque question a un texte et 4 choix non-vides
    
    for ( const q of questions ) {
    if (q.text.trim() === '') {
        alert('Chaque question doit avoir un texte.')
        return
    }
    if (q.choices.some(c => c.trim() === '')) {
        alert('Chaque question doit avoir 4 choix non-vides.')
        return
    }
    }

    // TODO: Appeler onSubmit(title, questions)
    const formattedQuestions: QuizQuestion[] = questions.map(q => ({
        id: q.id,
        text: q.text,
        choices: q.choices,
        correctIndex: q.correctIndex,
        timerSec: q.duration
    }))

    onSubmit(title, formattedQuestions)
    }

  return (
    <div className="phase-container">
      <h1>Creer un Quiz</h1>
      <form className="create-form" onSubmit={handleSubmit}>
        {/* TODO: Champ titre */}
        <div className="form-group">
            <label>Titre du quiz</label>
            <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
            />
        </div>
        {/* TODO: Liste des questions avec .question-card */}
        {questions.map((question, qIndex) => (
          <div key={question.id} className="question-card">
            <div className="question-card-header">
              <h3>Question {qIndex + 1}</h3>
            </div>

            <div className="form-group">
              <label>Texte</label>
              <input
                type="text"
                value={question.text}
                onChange={e =>
                  updateQuestion(question.id, { text: e.target.value })
                }
              />
            </div>

            <div className="choices-inputs">
              {question.choices.map((choice, index) => (
                <div key={index} className="choice-input-group">
                  <input
                    type="radio"
                    name={`correct-${question.id}`}
                    checked={question.correctIndex === index}
                    onChange={() =>
                      updateQuestion(question.id, { correctIndex: index })
                    }
                  />

                  <input
                    type="text"
                    value={choice}
                    placeholder={`Choix ${index + 1}`}
                    onChange={e =>
                      updateChoice(question.id, index, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
            </div>
         ))}
                
        {/* TODO: Bouton ajouter une question */}
            <button
                type="button"
                className="btn-add-question"
                onClick={addQuestion}
                >
                + Ajouter une question
            </button>
        {/* TODO: Bouton soumettre */}
            <button type="submit" className="btn-primary">
                Creer le quiz
            </button>
        
      </form>
    </div>
  )
}

export default CreateQuiz