'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const express_1 = __importDefault(require('express'))
const http_1 = __importDefault(require('http'))
const dotenv_1 = __importDefault(require('dotenv'))
const socket_io_1 = require('socket.io')
dotenv_1.default.config()
const app = (0, express_1.default)()
const server = http_1.default.createServer(app)
const PORT = process.env.PORT || 8000
const io = new socket_io_1.Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
  },
})
let users = []
io.on('connection', (socket) => {
  socket.on('new_user_send_from_client', (username) => {
    const user = {
      id: socket.id,
      username,
    }
    users.push(user)
    socket.broadcast.emit('new_user_acknowledge_from_server', user)
  })
  socket.on('send_chat_from_client', (message) => {
    const user = users.find((user) => user.id === socket.id)
    if (user) {
      socket.broadcast.emit(
        'send_chat_acknowledge_from_server',
        Object.assign({ message }, user)
      )
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
