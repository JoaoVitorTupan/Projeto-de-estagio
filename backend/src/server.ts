import 'dotenv/config'
import app from './app'
import { AppDataSource } from './config/data-source'

const PORT = Number(process.env.PORT) || 3000

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
    
  })
  .catch((error) => {
    console.error('Erro ao conectar no banco:', error)
  })