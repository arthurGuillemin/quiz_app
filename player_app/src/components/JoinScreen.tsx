import { useState } from 'react'
import '../App.css'

interface JoinScreenProps {
    /** Callback appele quand le joueur soumet le formulaire */
    onJoin: (code: string, name: string) => void
    /** Message d'erreur optionnel (ex: "Code invalide") */
    error?: string
}

function JoinScreen({ onJoin, error }: JoinScreenProps) {
    const [code, setCode] = useState('')
    const [name, setName] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // champ rempli
        if (code.trim() && name.trim()) {
            onJoin(code.toUpperCase(), name)
        }
    }

    return (
        <form className="join-form" onSubmit={handleSubmit}>
            <h1>Rejoindre un Quiz</h1>

            <div className="form-group">
                <input
                    type="text"
                    className="code-input"
                    placeholder="Code du quiz"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={6}
                    autoCapitalize="characters"
                />
                {error && <div className="error-message">{error}</div>}
            </div>
            <div className="form-group">
                <input type="text" placeholder="Votre pseudo" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary" disabled={!code.trim() || !name.trim()}> Commencer</button>
        </form>
    )
}

export default JoinScreen
