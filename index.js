import sequelize from './shared/database/database.js'
import { usersRouter } from "./users/router.js"
import express from 'express'

const app = express()
const PORT = 8000

app.use(express.json())
app.use('/api/users', usersRouter)

const startServer = async () => {
    await sequelize.sync({ force: true })
    console.log('db is ready')
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
    return server
  }

const serverPromise = startServer()  

export { app, serverPromise }