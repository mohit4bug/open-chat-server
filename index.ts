import express from 'express'
import http from 'http'
import dotenv from 'dotenv'
import { Server as SocketServer } from 'socket.io'

dotenv.config()
const app = express()

// test
app.get('/', (req, res) => {
  res.send('Welcome from Open Chat API')
})

const server = http.createServer(app)

const PORT = process.env.PORT || 8000

const io = new SocketServer(server, {
  cors: {
    origin: '*',
  },
})

type User = {
  id: string
  username: string
}
let users: User[] = []

io.on('connection', (socket) => {
  socket.on('new_user_send_from_client', (username: string) => {
    const user: User = {
      id: socket.id,
      username,
    }
    users.push(user)

    socket.broadcast.emit('new_user_acknowledge_from_server', user)
  })

  socket.on('send_chat_from_client', (message: string) => {
    const user = users.find((user) => user.id === socket.id)

    if (user) {
      socket.broadcast.emit('send_chat_acknowledge_from_server', {
        message,
        ...user,
      })
    }
  })

  socket.on('disconnect', () => {
    const disconnectedUser = users.find((user) => user.id === socket.id)
    if (disconnectedUser) {
      users = users.filter((user) => user.id !== socket.id)
      socket.broadcast.emit(
        'username_after_disconnect_from_server',
        disconnectedUser.username
      )
    }
  })
})

server.listen(PORT, () => {
  console.log('🎉')
})
