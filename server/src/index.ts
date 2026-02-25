// ============================================================
// Serveur WebSocket - Point d'entree
// A IMPLEMENTER : remplir les cas du switch avec la logique
// ============================================================

import { createServer } from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import type { ClientMessage } from '@shared/index'
import { QuizRoom } from './quizRooms'
import { send, generateQuizCode } from './utils'

const PORT = 3001

// ---- Stockage global des salles ----
/** Map des salles : code du quiz -> QuizRoom */
const rooms = new Map<string, QuizRoom>()

/** Map inverse pour retrouver la salle d'un joueur : WebSocket -> { room, playerId } */
const clientRoomMap = new Map<WebSocket, { room: QuizRoom; playerId: string }>()

/** Map pour retrouver la salle du host : WebSocket -> QuizRoom */
const hostRoomMap = new Map<WebSocket, QuizRoom>()

// ---- Creation du serveur HTTP + WebSocket ----
const httpServer = createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('Quiz WebSocket Server is running')
})

const wss = new WebSocketServer({ server: httpServer })

console.log(`[Server] Demarrage sur le port ${PORT}...`)

// ---- Gestion des connexions WebSocket ----
wss.on('connection', (ws: WebSocket) => {
  console.log('[Server] Nouvelle connexion WebSocket')

  ws.on('message', (raw: Buffer) => {
    // --- Parsing du message JSON ---
    let message: ClientMessage
    try {
      message = JSON.parse(raw.toString()) as ClientMessage
    } catch {
      send(ws, { type: 'error', message: 'Message JSON invalide' })
      return
    }

    console.log('[Server] Message recu:', message.type)

    // --- Routage par type de message ---
    switch (message.type) {
      // ============================================================
      // Un joueur veut rejoindre un quiz
      // ============================================================
      case 'join': {
        const room = rooms.get(message.quizCode)
        if (!room) {
          send(ws, { type: 'error', message: 'Salle introuvable' })
          return
        }
        if (room.phase !== 'lobby') {
          send(ws, { type: 'error', message: 'Quiz déjà commencé' })
          return
        }
        const playerId = room.addPlayer(message.name, ws)
        clientRoomMap.set(ws, { room, playerId })
        break
      }

      // ============================================================
      // Un joueur envoie sa reponse
      // ============================================================
      case 'answer': {
        const client = clientRoomMap.get(ws)
        if (!client) {
          send(ws, { type: 'error', message: 'Joueur introuvable' })
          return
        }
        client.room.handleAnswer(client.playerId, message.choiceIndex)
        break
      }

      // ============================================================
      // Le host cree un nouveau quiz
      // ============================================================
      case 'host:create': {
        const code = generateQuizCode()
        const room = new QuizRoom(Date.now().toString(), code)
        room.hostWs = ws
        room.title = message.title
        room.questions = message.questions
        rooms.set(code, room)
        hostRoomMap.set(ws, room)
        send(ws, { type: 'sync', phase: 'lobby', data: { quizCode: code } })
        console.log(`[Server] Quiz cree avec le code: ${code}`)
        break
      }

      // ============================================================
      // Le host demarre le quiz
      // ============================================================
      case 'host:start': {
        const room = hostRoomMap.get(ws)
        if (!room) { send(ws, { type: 'error', message: '...' }); return }
        room.start()
        break
      }

      // ============================================================
      // Le host passe a la question suivante
      // ============================================================
      case 'host:next': {
        const room = hostRoomMap.get(ws)
        if (!room) { send(ws, { type: 'error', message: 'Room introuvable' }); return }
        room.nextQuestion()
        break
      }

      // ============================================================
      // Le host termine le quiz
      // ============================================================
      case 'host:end': {
        const room = hostRoomMap.get(ws)
        if (!room) { send(ws, { type: 'error', message: 'Room introuvable' }); return }
        room.end()
        rooms.delete(room.code)
        hostRoomMap.delete(ws)
        for (const [clientWs, data] of clientRoomMap) {
          if (data.room === room) clientRoomMap.delete(clientWs)
        }
        break
      }
      default: {
        send(ws, { type: 'error', message: `Type de message inconnu` })
      }
    }
  })

  // --- Gestion de la deconnexion ---
  ws.on('close', () => {
    console.log('[Server] Connexion fermee')
    clientRoomMap.delete(ws)
    hostRoomMap.delete(ws)
  })

  ws.on('error', (err: Error) => {
    console.error('[Server] Erreur WebSocket:', err.message)
  })
})

// ---- Demarrage du serveur ----
httpServer.listen(PORT, () => {
  console.log(`[Server] Serveur WebSocket demarre sur ws://localhost:${PORT}`)
})