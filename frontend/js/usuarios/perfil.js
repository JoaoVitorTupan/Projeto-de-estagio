(function () {
    "use strict";

    const CAMINHO_UTILS = "../../js/utils/";
    const CAMINHO_JS = "../../js/usuarios/";

    let inicializacaoEmAndamento = null;
    let eventosConfigurados = false;

    function carregarScript(id, src) {
        return new Promise((resolve, reject) => {
            const existente = document.getElementById(id);

            if (existente) {
                if (existente.dataset.carregado === "true") {
                    resolve();
                    return;
                }

                existente.addEventListener("load", () => {
                    existente.dataset.carregado = "true";
                    resolve();
                }, { once: true });

                existente.addEventListener("error", () => {
                    existente.remove();
                    reject(new Error(`Não foi possível carregar ${src}.`));
                }, { once: true });

                return;
            }

            const script = document.createElement("script");

            script.id = id;
            script.src = src;
            script.async = false;

            script.addEventListener("load", () => {
                script.dataset.carregado = "true";
                resolve();
            }, { once: true });

            script.addEventListener("error", () => {
                script.remove();
                reject(new Error(`Não foi possível carregar ${src}.`));
            }, { once: true });

            document.body.appendChild(script);
        });
    }

    async function carregarDependencias() {
        if (!window.Autenticacao) {
            await carregarScript(
                "utilAutenticacaoPerfil",
                `${CAMINHO_UTILS}autenticacao.js`
            );
        }

        if (!window.PerfilApi) {
            await carregarScript(
                "perfilApi",
                `${CAMINHO_JS}perfilApi.js`
            );
        }

        if (!window.Autenticacao) {
            throw new Error("O módulo de autenticação não foi carregado.");
        }

        if (!window.PerfilApi) {
            throw new Error("O módulo de API do perfil não foi carregado.");
        }
    }

    async function inicializar() {
        if (inicializacaoEmAndamento) {
            return inicializacaoEmAndamento;
        }

        inicializacaoEmAndamento = executarInicializacao();

        try {
            return await inicializacaoEmAndamento;
        } finally {
            inicializacaoEmAndamento = null;
        }
    }

    async function executarInicializacao() {
        try {
            await carregarDependencias();

            const autenticacao = window.Autenticacao;

            if (!autenticacao.estaAutenticado()) {
                autenticacao.redirecionarParaLogin();
                return false;
            }

            configurarEventos();

            await carregarPerfil();

            return true;
        } catch (erro) {
            console.error("Erro ao inicializar o perfil:", erro);
            throw erro;
        }
    }

    async function carregarPerfil() {
        const nome = document.getElementById("nomeUsuario");
        const email = document.getElementById("emailUsuario");
        const role = document.getElementById("roleUsuario");

        if (!nome || !email || !role) {
            throw new Error("Os campos do perfil não foram encontrados.");
        }

        nome.textContent = "Carregando...";
        email.textContent = "Carregando...";
        role.textContent = "Carregando...";

        try {
            const usuario = await window.PerfilApi.obterPerfil();

            if (!usuario) {
                return false;
            }

            exibirPerfil(usuario);

            return true;
        } catch (erro) {
            console.error("Erro ao buscar os dados do perfil:", erro);

            nome.textContent = "-";
            email.textContent = "-";
            role.textContent = "-";

            throw erro;
        }
    }

    function exibirPerfil(usuario) {
        document.getElementById("nomeUsuario").textContent =
            usuario.nome || "-";

        document.getElementById("emailUsuario").textContent =
            usuario.email || "-";

        document.getElementById("roleUsuario").textContent =
            formatarRole(usuario.role);
    }

    function formatarRole(role) {
        const perfis = {
            administrador: "Administrador",
            gestor: "Gestor",
            financeiro: "Financeiro"
        };

        return perfis[role] || "Usuário";
    }

    function configurarEventos() {
        if (eventosConfigurados) {
            return;
        }

        const modal = document.getElementById("modalPerfil");
        const botaoFechar = document.getElementById("btnFecharPerfil");

        if (!modal || !botaoFechar) {
            throw new Error("A estrutura da modal de perfil não foi encontrada.");
        }

        botaoFechar.addEventListener("click", fecharModal);

        modal.addEventListener("click", evento => {
            if (evento.target === modal) {
                fecharModal();
            }
        });

        document.addEventListener("keydown", tratarTeclaEsc);

        eventosConfigurados = true;
    }

    function tratarTeclaEsc(evento) {
        if (evento.key === "Escape") {
            fecharModal();
        }
    }

    function fecharModal() {
        const modal = document.getElementById("modalPerfil");

        if (!modal) {
            return;
        }

        modal.remove();
        document.removeEventListener("keydown", tratarTeclaEsc);

        eventosConfigurados = false;
    }

    window.Perfil = Object.freeze({
        inicializar,
        carregarPerfil,
        fecharModal
    });
})();