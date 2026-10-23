(function () {
    "use strict";

    // Matriz oficial de permissões para navegação e páginas
    const PERMISSOES = Object.freeze({
        "dashboard": ["administrador", "gestor"],
        "contas": ["administrador", "gestor", "financeiro"],
        "clientes-fornecedores": ["administrador", "gestor", "financeiro"],
        "plano-de-contas": ["administrador"],
        "relatorios": ["administrador", "gestor"],
        "usuarios": ["administrador"]
    });

    function obterPaginaAtual() {
        const caminho = window.location.pathname.toLowerCase();

        if (caminho.includes("dashboard")) {
            return "dashboard";
        }
        if (caminho.includes("conta.html") || (caminho.includes("/contas/") && !caminho.includes("plano"))) {
            return "contas";
        }
        if (caminho.includes("clienteoufornecedor") || caminho.includes("clientes-fornecedores")) {
            return "clientes-fornecedores";
        }
        if (caminho.includes("planodeconta") || caminho.includes("plano-de-contas")) {
            return "plano-de-contas";
        }
        if (caminho.includes("relatorio")) {
            return "relatorios";
        }
        if (caminho.includes("usuario.html") || (caminho.includes("/usuarios/") && !caminho.includes("perfil"))) {
            return "usuarios";
        }

        return "";
    }

    function obterUsuarioLogado() {
        if (window.Autenticacao && typeof window.Autenticacao.obterUsuario === "function") {
            const usuario = window.Autenticacao.obterUsuario();
            if (usuario) {
                return usuario;
            }
        }

        try {
            const salvo = localStorage.getItem("usuario");
            return salvo ? JSON.parse(salvo) : null;
        } catch {
            return null;
        }
    }

    function obterPerfilUsuario() {
        const usuario = obterUsuarioLogado();
        return usuario && usuario.role ? String(usuario.role).toLowerCase() : "";
    }

    function obterPaginaInicialAutorizada(perfil) {
        if (perfil === "financeiro") {
            return "../contas/conta.html";
        }

        // Administrador e Gestor
        return "../dashboard/dashboard.html";
    }

    function verificarAcessoImediato() {
        const pagina = obterPaginaAtual();
        if (!pagina || !PERMISSOES[pagina]) {
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            // Usuário sem token: o script da página ou autenticação redirecionará para login
            return;
        }

        const perfil = obterPerfilUsuario();
        const permitidos = PERMISSOES[pagina];

        if (perfil && !permitidos.includes(perfil)) {
            console.warn(`Acesso negado à página "${pagina}" para o perfil "${perfil}". Redirecionando...`);
            window.location.replace(obterPaginaInicialAutorizada(perfil));
        }
    }

    // Executa verificação imediata para bloquear acesso antes da renderização
    verificarAcessoImediato();

    function renderizarNavbar() {
        const header = document.getElementById("navbarGlobal");
        if (!header) {
            return;
        }

        const paginaAtiva = header.dataset.pagina || obterPaginaAtual();
        const perfil = obterPerfilUsuario();

        const todasOpcoes = [
            { id: "dashboard", rotulo: "Dashboard", href: "../dashboard/dashboard.html", roles: ["administrador", "gestor"] },
            { id: "contas", rotulo: "Contas", href: "../contas/conta.html", roles: ["administrador", "gestor", "financeiro"] },
            { id: "clientes-fornecedores", rotulo: "Clientes e Fornecedores", href: "../clientes-fornecedores/clienteOuFornecedor.html", roles: ["administrador", "gestor", "financeiro"] },
            { id: "plano-de-contas", rotulo: "Plano de Contas", href: "../plano-de-contas/planoDeConta.html", roles: ["administrador"] },
            { id: "relatorios", rotulo: "Relatórios", href: "../relatorios/relatorios.html", roles: ["administrador", "gestor"] },
            { id: "usuarios", rotulo: "Gerenciar Usuários", href: "../usuarios/usuario.html", roles: ["administrador"] }
        ];

        // Exibe apenas as opções estritamente permitidas para o perfil autenticado
        const itens = todasOpcoes.filter((item) => item.roles.includes(perfil));

        const linksHtml = itens.map((item) => {
            const ativo = item.id === paginaAtiva;
            const classeAtivo = ativo ? " navbar-link-ativo" : "";
            const ariaCurrent = ativo ? ' aria-current="page"' : "";

            return `<a href="${item.href}" class="navbar-link${classeAtivo}" data-item="${item.id}"${ariaCurrent}>${item.rotulo}</a>`;
        }).join("");

        header.innerHTML = `
            <div class="navbar-conteudo">
                <div class="navbar-esquerda">
                    <span class="navbar-marca">SFCPR</span>
                    <nav class="navbar-links" aria-label="Navegação principal">
                        ${linksHtml}
                    </nav>
                </div>
                <div class="navbar-acoes">
                    <button type="button" class="navbar-btn navbar-btn-perfil" id="abrirPerfil" title="Visualizar perfil">
                        Perfil
                    </button>
                    <button type="button" class="navbar-btn navbar-btn-sair" id="botaoSair" title="Sair do sistema">
                        Sair
                    </button>
                </div>
            </div>
        `;

        const btnSair = header.querySelector("#botaoSair");
        btnSair?.addEventListener("click", (evento) => {
            evento.preventDefault();
            if (window.Autenticacao && typeof window.Autenticacao.redirecionarParaLogin === "function") {
                window.Autenticacao.redirecionarParaLogin();
            } else {
                localStorage.removeItem("token");
                localStorage.removeItem("usuario");
                window.location.href = "../autenticacao/login.html";
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", renderizarNavbar);
    } else {
        renderizarNavbar();
    }

    window.NavbarGlobal = Object.freeze({
        renderizar: renderizarNavbar,
        obterPerfilUsuario,
        obterPaginaInicialAutorizada,
        PERMISSOES
    });
})();

