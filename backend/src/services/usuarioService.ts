import { usuarioRepository } from "../repositories/usuarioRepository";
import { BadRequestError } from "../utils/api-erros";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface CadastroUsuarioDTO {
  nome: string;
  email: string;
  senha: string;
  confirmSenha: string;
  role: string;
}

interface LoginUsuarioDTO {
  email: string;
  senha: string;
}

interface AtualizarUsuarioDTO {
  id: number | string;
  nome: string;
  email: string;
  role: string;
  status: boolean;
}

interface RedefinirSenhaDTO {
  email: string;
  newSenha: string;
  confirmSenha: string;
}

class UsuarioService {

  async Cadastro({ nome, email, senha, confirmSenha, role }: CadastroUsuarioDTO) {

    const usuarioExiste = await usuarioRepository.findOneBy({ email });

    if (!nome || !email || !senha || !confirmSenha) {
      throw new BadRequestError("Preencha todos os campos");
    }

    if (senha !== confirmSenha) {
      throw new BadRequestError("As senhas não coincidem");
    }

    if (senha.length < 8) {
      throw new BadRequestError("A senha deve ter no mínimo 8 caracteres.");
    }

    if (usuarioExiste) {
      throw new BadRequestError("Email já existe");
    }

    const hashSenha = await bcrypt.hash(senha, 10);
    
    const newUsuario = usuarioRepository.create({
      nome,
      email,
      senha: hashSenha,
      role
    });

    await usuarioRepository.save(newUsuario);

    const { senha: _, ...usuario } = newUsuario;

    return usuario;
  }

  async login({ email, senha }: LoginUsuarioDTO) {
    
    const usuario = await usuarioRepository.findOneBy({
      email,
      status: true
    });

    if (!usuario) {
      throw new BadRequestError("E-mail ou senha inválidos");
    }

    const verificarSenha = await bcrypt.compare(senha, usuario.senha);

    if (!verificarSenha) {
      throw new BadRequestError("E-mail ou senha inválidos");
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        role: usuario.role
      },
      process.env.JWT_PASS ?? "",
      { expiresIn: "8h" }
    );

    const { senha: _, ...usuarioLogin } = usuario;

    return {
      usuario: usuarioLogin,
      token
    };
  }

  async getUsuarios() {
    const usuario = await usuarioRepository.find();

    return usuario.map(usuario => {
      const { senha: _, ...rest } = usuario;
      return rest;
    });
  }

  async atualizar({ id, nome, email, role, status }: AtualizarUsuarioDTO) {

    const usuario = await usuarioRepository.findOneBy({ id: Number(id) });

    if (!usuario) {
      throw new BadRequestError("Usuário não encontrado");
    }

    if (!nome || !email) {
      throw new BadRequestError("Nome e email são obrigatórios");
    }

    const emailExiste = await usuarioRepository.findOneBy({ email });

    if (emailExiste && emailExiste.id !== usuario.id) {
      throw new BadRequestError("Email já está em uso");
    }

    usuario.nome = nome;
    usuario.email = email;
    usuario.role = role;
    usuario.status = status;

    await usuarioRepository.save(usuario);

    const { senha: _, ...atualizarUsuario } = usuario;

    return atualizarUsuario;
  }

  async inativar(id: number, usuarioLogadoId: number) {
    if (id === usuarioLogadoId) {
      throw new BadRequestError("Não é permitido inativar seu próprio usuário");
    }

    const usuario = await usuarioRepository.findOne({
      where: { id }
    });

    if (!usuario) {
      throw new BadRequestError(
        "Usuário não encontrado"
      );
    }

    usuario.status = false;

    await usuarioRepository.save(usuario);

    const { senha: _, ...usuarioInativado } = usuario;

    return usuarioInativado;
  }

  async reativar(id: number) {

    const usuario = await usuarioRepository.findOne({
      where: { id }
    });

    if (!usuario) {
      throw new BadRequestError(
        "Usuário não encontrado"
      );
    }

    usuario.status = true;

    await usuarioRepository.save(usuario);

    const { senha: _, ...usuarioReativado } = usuario;

    return usuarioReativado;
  }

  async redefinirSenha({ email, newSenha, confirmSenha }: RedefinirSenhaDTO) {
    
    if (!email || !newSenha || !confirmSenha) {
      throw new BadRequestError("Preencha todos os campos");
    }

    if (newSenha !== confirmSenha) {
      throw new BadRequestError("As senhas não coincidem");
    }

    if (newSenha.length < 8) {
      throw new BadRequestError("A senha deve ter no mínimo 8 caracteres.");
    }

    const usuario = await usuarioRepository.findOneBy({ email });

    if (!usuario) {
      throw new BadRequestError("Usuário não encontrado");
    }

    const hashSenha = await bcrypt.hash(newSenha, 10);

    usuario.senha = hashSenha;

    await usuarioRepository.save(usuario);

    return { message: "Senha redefinida com sucesso" };
  }
}

export default new UsuarioService();