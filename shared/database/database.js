import * as dotenv from 'dotenv'
import { Sequelize } from 'sequelize'

dotenv.config()

const sequelize = new Sequelize( {
  dialect: 'sqlite',
  storage: process.env.DATABASE_NAME || ':memory:',
  logging: false
})

export default sequelize
