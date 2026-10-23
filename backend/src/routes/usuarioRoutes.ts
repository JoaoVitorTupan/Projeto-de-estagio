import { Router } from 'express'
import { UsuarioController } from '../controllers/usuarioController'
import { authMiddleware, autorizarPorPerfil } from '../middlewares/authMiddleware'

const usuarioRoutes = Router()
const usuarioController = new UsuarioController()

usuarioRoutes.post('/login', usuarioController.login)
usuarioRoutes.put('/redefinir-senha', usuarioController.redefinirSenha)

// Perfil acessível por todos os usuários autenticados
usuarioRoutes.get('/perfil', authMiddleware, autorizarPorPerfil('administrador', 'gestor', 'financeiro'), usuarioController.getPerfil)

// Operações de gerenciamento de usuários restritas ao Administrador
usuarioRoutes.get('/', authMiddleware, autorizarPorPerfil('administrador'), usuarioController.getUsuarios)
usuarioRoutes.post('/', authMiddleware, autorizarPorPerfil('administrador'), usuarioController.Cadastro)
usuarioRoutes.put('/:id', authMiddleware, autorizarPorPerfil('administrador'), usuarioController.atualizar)
usuarioRoutes.delete('/:id', authMiddleware, autorizarPorPerfil('administrador'), usuarioController.inativar)
usuarioRoutes.patch('/reativar/:id', authMiddleware, autorizarPorPerfil('administrador'), usuarioController.reativar)

export default usuarioRoutes