(function () {
    "use strict";

    const CHAVE_TOKEN = "token";
    const CHAVE_USUARIO = "usuario";

    // Matriz oficial de permissões do sistema
    const PERMISSOES = Object.freeze({
        "dashboard": ["administrador", "gestor"],
        "contas": ["administrador", "gestor", "financeiro"],
        "clientes-fornecedores": ["administrador", "gestor", "financeiro"],
        "relatorios": ["administrador", "gestor"],
        "plano-de-contas": ["administrador"],
        "usuarios": ["administrador"],
        "perfil": ["administrador", "gestor", "financeiro"]
    });

    function obterToken() {
        return localStorage.getItem(CHAVE_TOKEN);
    }

    function obterUsuario() {
        try {
            const usuario = localStorage.getItem(CHAVE_USUARIO);
            return usuario ? JSON.parse(usuario) : null;
        } catch (erro) {
            console.error("Não foi possível ler o usuario armazenado.", erro);
            return null;
        }
    }

    function obterPerfil() {
        const usuario = obterUsuario();
        return usuario && usuario.role ? String(usuario.role).toLowerCase() : "";
    }

    function estaAutenticado() {
        return Boolean(obterToken());
    }

    function obterCabecalhoAutorizacao() {
        const token = obterToken();

        if (!token) {
            return {};
        }

        return {
            Autorizado: `Bearer ${token}`
        };
    }

    function removerSessao() {
        localStorage.removeItem(CHAVE_TOKEN);
        localStorage.removeItem(CHAVE_USUARIO);
    }

    function redirecionarParaLogin() {
        removerSessao();
        window.location.href = window.location.pathname.includes('/pages/')
            ? '../autenticacao/login.html'
            : '/pages/autenticacao/login.html';
    }

    function obterPaginaInicialAutorizada() {
        const perfil = obterPerfil();
        const base = window.location.pathname.includes('/pages/') ? '../' : 'pages/';

        if (perfil === "financeiro") {
            return `${base}contas/conta.html`;
        }

        // Administrador e Gestor iniciam no Dashboard
        return `${base}dashboard/dashboard.html`;
    }

    function redirecionarParaPaginaAutorizada() {
        window.location.replace(obterPaginaInicialAutorizada());
    }

    function podeAcessar(funcionalidade) {
        if (!estaAutenticado()) {
            return false;
        }

        const perfil = obterPerfil();
        const permitidos = PERMISSOES[funcionalidade];

        if (!permitidos) {
            return false;
        }

        return permitidos.includes(perfil);
    }

    function validarAcessoPagina(pagina) {
        if (!estaAutenticado()) {
            redirecionarParaLogin();
            return false;
        }

        if (!podeAcessar(pagina)) {
            console.warn(`Acesso negado para a página "${pagina}" com perfil "${obterPerfil()}". Redirecionando...`);
            redirecionarParaPaginaAutorizada();
            return false;
        }

        return true;
    }

    async function sincronizarPerfil() {
        const token = obterToken();
        if (!token) {
            return null;
        }

        try {
            const resposta = await fetch("http://localhost:3000/usuarios/perfil", {
                method: "GET",
                headers: obterCabecalhoAutorizacao()
            });

            if (tratarRespostaNaoAutorizada(resposta)) {
                return null;
            }

            if (resposta.ok) {
                const dados = await resposta.json();
                if (dados && dados.role) {
                    localStorage.setItem(CHAVE_USUARIO, JSON.stringify(dados));
                    return dados;
                }
            }
        } catch (erro) {
            console.warn("Não foi possível sincronizar o perfil com o backend:", erro);
        }

        return obterUsuario();
    }

    function tratarRespostaNaoAutorizada(resposta) {
        if (!resposta) {
            return false;
        }

        if (resposta.status === 401) {
            redirecionarParaLogin();
            return true;
        }

        if (resposta.status === 403) {
            console.warn("Requisição bloqueada pelo servidor (HTTP 403). Redirecionando para página autorizada.");
            redirecionarParaPaginaAutorizada();
            return true;
        }

        return false;
    }

    window.Autenticacao = Object.freeze({
        obterToken,
        obterUsuario,
        obterPerfil,
        estaAutenticado,
        obterCabecalhoAutorizacao,
        removerSessao,
        redirecionarParaLogin,
        obterPaginaInicialAutorizada,
        redirecionarParaPaginaAutorizada,
        podeAcessar,
        validarAcessoPagina,
        sincronizarPerfil,
        tratarRespostaNaoAutorizada,
        PERMISSOES
    });
})();