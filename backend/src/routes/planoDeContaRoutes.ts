import { Router } from 'express'
import { PlanoDeContaController } from '../controllers/planoDeContaController'
import { authMiddleware, autorizarPorPerfil } from '../middlewares/authMiddleware'

const planoDeContaRoutes = Router()
const planoDeContaController = new PlanoDeContaController()

// Rota auxiliar necessária para selecionar planos de contas nas telas autorizadas (ex: Contas)
planoDeContaRoutes.get('/', authMiddleware, planoDeContaController.listar)

// Operações de gerenciamento restritas ao Administrador
planoDeContaRoutes.post('/', authMiddleware, autorizarPorPerfil('administrador'), planoDeContaController.cadastrar)
planoDeContaRoutes.put('/:id', authMiddleware, autorizarPorPerfil('administrador'), planoDeContaController.atualizar)
planoDeContaRoutes.delete('/:id', authMiddleware, autorizarPorPerfil('administrador'), planoDeContaController.inativar)
planoDeContaRoutes.patch('/reativar/:id', authMiddleware, autorizarPorPerfil('administrador'), planoDeContaController.reativar)

export default planoDeContaRoutes