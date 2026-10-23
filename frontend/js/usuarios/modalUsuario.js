(function () {
    "use strict";

    function obterModalCadastro() {
        return document.getElementById("modal");
    }

    function obterModalEdicao() {
        return document.getElementById("modalEditar");
    }

    function abrirCadastro() {
        const modal = obterModalCadastro();

        if (!modal) {
            return;
        }

        UsuarioFormulario.limparCadastro();

        modal.style.display = "flex";
    }

    function fecharCadastro() {
        const modal = obterModalCadastro();

        if (modal) {
            modal.style.display = "none";
        }
    }

    function abrirEdicao(usuario) {
        const modal = obterModalEdicao();

        if (!modal) {
            return;
        }

        const campos = UsuarioFormulario.obterCamposEdicao();

        campos.id.value = usuario.id;
        campos.nome.value = usuario.nome || "";
        campos.email.value = usuario.email || "";
        campos.role.value = usuario.role || "";

        modal.style.display = "flex";
    }

    function fecharEdicao() {
        const modal = obterModalEdicao();

        if (modal) {
            modal.style.display = "none";
        }
    }

    async function salvarUsuario() {
        const dados = UsuarioFormulario.obterDadosCadastro();
        const erro = UsuarioValidacao.validarCadastro(dados);

        if (erro) {
            UsuarioFormulario.mostrarErro(erro);

            return false;
        }

        try {
            await UsuarioApi.cadastrarUsuario(dados);

            alert("Usuario cadastrado com sucesso!");

            fecharCadastro();

            UsuarioFormulario.limparCadastro();

            return true;
        } catch (erro) {
            console.error("Erro ao cadastrar usuario:", erro);
            UsuarioFormulario.mostrarErro(erro.message || "Erro ao cadastrar usuario");

            return false;
        }
    }

    async function atualizarUsuario() {
        const dados = UsuarioFormulario.obterDadosEdicao();
        const erro = UsuarioValidacao.validarEdicao(dados);

        if (erro) {
            alert(erro);

            return false;
        }

        try {
            await UsuarioApi.atualizarUsuario(dados.id, {
                nome: dados.nome,
                email: dados.email,
                role: dados.role,
            });

            alert("Usuario atualizado com sucesso!");

            fecharEdicao();

            return true;
        } catch (erro) {
            console.error("Erro ao atualizar usuario:", erro);

            alert(erro.message || "Erro ao atualizar usuario");

            return false;
        }
    }

    function configurarEventos() {
        const btnSalvar = document.getElementById("btnSalvar");
        const btnCancelar = document.getElementById("btnCancelar");
        const btnAtualizar = document.getElementById("btnAtualizar");
        const btnCancelarEditar = document.getElementById("btnCancelarEditar");
        const modalCadastro = obterModalCadastro();
        const modalEdicao = obterModalEdicao();

        btnSalvar?.addEventListener("click", salvarUsuario);
        btnCancelar?.addEventListener("click", fecharCadastro);
        btnAtualizar?.addEventListener("click", async () => {
            const atualizado = await atualizarUsuario();

                if (atualizado && typeof window.carregarUsuarios === "function") {
                    await window.carregarUsuarios();
                }
            }
        );

        btnCancelarEditar?.addEventListener("click", fecharEdicao);

        modalCadastro?.addEventListener("click", (evento) => {
            if (evento.target === modalCadastro) {
                fecharCadastro();
            }
        });

        modalEdicao?.addEventListener("click", (evento) => {
            if (evento.target === modalEdicao) {
                fecharEdicao();
            }
        });
    }

    window.ModalUsuario = Object.freeze({
        abrirCadastro,
        fecharCadastro,
        abrirEdicao,
        fecharEdicao,
        salvarUsuario,
        atualizarUsuario,
        configurarEventos
    });
})();