document.addEventListener("DOMContentLoaded", async () => {
    "use strict";

    const CAMINHO_JS = "../../js/usuarios/";
    const CAMINHO_UTILS = "../../js/utils/";

    let usuariosCarregados = [];

    const dependencias = [
        {
            id: "utilAutenticacao",
            src: `${CAMINHO_UTILS}autenticacao.js`
        },
        {
            id: "utilDOM",
            src: `${CAMINHO_UTILS}dom.js`
        },
        {
            id: "usuarioFormatadores",
            src: `${CAMINHO_JS}usuarioFormatadores.js`
        },
        {
            id: "usuarioValidacao",
            src: `${CAMINHO_JS}usuarioValidacao.js`
        },
        {
            id: "usuarioFormulario",
            src: `${CAMINHO_JS}usuarioFormulario.js`
        },
        {
            id: "usuarioApi",
            src: `${CAMINHO_JS}usuarioApi.js`
        }
    ];

    function carregarScript(id, src) {
        return new Promise((resolve, reject) => {
            const existente = document.getElementById(id);

            if (existente) {
                if (existente.dataset.carregado === "true") {
                    resolve();
                    return;
                }

                existente.addEventListener("load", resolve, { once: true });
                existente.addEventListener(
                    "error",
                    () => reject(new Error(`Não foi possível carregar ${src}.`)),
                    { once: true }
                );

                return;
            }

            const script = document.createElement("script");

            script.id = id;
            script.src = src;
            script.async = false;

            script.addEventListener(
                "load",
                () => {
                    script.dataset.carregado = "true";
                    resolve();
                },
                { once: true }
            );

            script.addEventListener(
                "error",
                () => reject(new Error(`Não foi possível carregar ${src}.`)),
                { once: true }
            );

            document.body.appendChild(script);
        });
    }

    async function carregarDependencias() {
        for (const dependencia of dependencias) {
            await carregarScript(dependencia.id, dependencia.src);
        }
    }

    async function carregarModalHTML(caminho) {
        const containerModais = document.getElementById("containerModais");

        if (!containerModais) {
            throw new Error("Elemento #containerModais não encontrado.");
        }

        const resposta = await fetch(caminho);

        if (!resposta.ok) {
            throw new Error(`Não foi possível carregar ${caminho}.`);
        }

        const html = await resposta.text();
        const parser = new DOMParser();
        const documento = parser.parseFromString(html, "text/html");

        containerModais.innerHTML = documento.body.innerHTML;
    }

    async function carregarModalUsuario() {
        try {
            await carregarModalHTML("modalUsuario.html");

            if (window.DOM) {
                window.DOM.carregarCSS(
                    "cssModalUsuario",
                    "../../css/usuarios/modalUsuario.css"
                );
            }

            await carregarScript(
                "scriptModalUsuario",
                `${CAMINHO_JS}modalUsuario.js`
            );

            return true;
        } catch (erro) {
            console.error("Erro ao carregar a modal de usuário:", erro);
            return false;
        }
    }

    async function inicializar() {
        try {
            await carregarDependencias();

            const autenticacao = window.Autenticacao;

            if (!autenticacao.estaAutenticado()) {
                autenticacao.redirecionarParaLogin();
                return;
            }

            if (!autenticacao.validarAcessoPagina("usuarios")) {
                return;
            }

            autenticacao.sincronizarPerfil().catch(() => {});

            const modalCarregada = await carregarModalUsuario();

            if (!modalCarregada) {
                alert("Não foi possível carregar a janela de usuários.");
                return;
            }

            configurarInterface();

            if (window.ModalUsuario) {
                window.ModalUsuario.configurarEventos();
            }

            await carregarUsuarios();
        } catch (erro) {
            console.error("Erro ao inicializar a página de usuários:", erro);
            alert("Não foi possível inicializar a página de usuários.");
        }
    }

    async function carregarUsuarios() {
        try {
            const usuarios = await window.UsuarioApi.listarUsuarios();

            if (!Array.isArray(usuarios)) {
                return;
            }

            usuariosCarregados = usuarios;
            renderizarUsuarios(usuariosCarregados);
        } catch (erro) {
            console.error("Erro ao carregar usuários:", erro);
            alert("Erro ao carregar usuários.");
        }
    }

    function renderizarUsuarios(usuarios) {
        const tabela = document.getElementById("usuariosTable");

        if (!tabela) {
            return;
        }

        tabela.innerHTML = "";

        usuarios.forEach(usuario => {
            const linha = document.createElement("tr");

            const nome = document.createElement("td");
            nome.textContent = usuario.nome ?? "";

            const email = document.createElement("td");
            email.textContent = usuario.email ?? "";

            const perfil = document.createElement("td");
            perfil.textContent = window.UsuarioFormatadores.formatarRole(
                usuario.role
            );

            const status = document.createElement("td");
            status.textContent = window.UsuarioFormatadores.formatarStatus(
                usuario.status
            );

            const acoes = document.createElement("td");
            const containerAcoes = document.createElement("div");
            containerAcoes.className = "acoesTabela";

            const botaoEditar = document.createElement("button");
            botaoEditar.type = "button";
            botaoEditar.className = "btnAcaoTabela btnEditar";
            botaoEditar.dataset.acao = "editar";
            botaoEditar.dataset.id = String(usuario.id);
            botaoEditar.title = "Editar";
            botaoEditar.setAttribute("aria-label", "Editar usuário");

            const imagemEditar = document.createElement("img");
            imagemEditar.src = "../../assets/editarLapis.png";
            imagemEditar.alt = "Editar";

            botaoEditar.appendChild(imagemEditar);

            const labelStatus = document.createElement("label");
            labelStatus.className = "switchStatus";
            labelStatus.title = usuario.status ? "Inativar" : "Ativar";

            const controleStatus = document.createElement("input");
            controleStatus.type = "checkbox";
            controleStatus.dataset.acao = "status";
            controleStatus.dataset.id = String(usuario.id);
            controleStatus.checked = Boolean(usuario.status);
            controleStatus.setAttribute(
                "aria-label",
                `${usuario.status ? "Inativar" : "Ativar"} usuário ${usuario.nome ?? ""}`
            );

            const sliderStatus = document.createElement("span");
            sliderStatus.className = "sliderStatus";

            labelStatus.append(controleStatus, sliderStatus);
            containerAcoes.append(botaoEditar, labelStatus);
            acoes.appendChild(containerAcoes);

            linha.append(nome, email, perfil, status, acoes);
            tabela.appendChild(linha);
        });
    }

    function buscarUsuarios() {
        const campoBusca = document.getElementById("busca");
        const busca = campoBusca?.value.toLowerCase().trim() || "";
        const linhas = document.querySelectorAll("#usuariosTable tr");

        linhas.forEach(linha => {
            const nome = linha.children[0]?.textContent.toLowerCase() || "";
            const email = linha.children[1]?.textContent.toLowerCase() || "";

            linha.style.display =
                nome.includes(busca) || email.includes(busca) ? "" : "none";
        });
    }

    async function tratarAlteracaoStatus(controle) {
        const id = Number(controle.dataset.id);
        const usuario = usuariosCarregados.find(
            item => Number(item.id) === id
        );

        if (!Number.isInteger(id) || !usuario) {
            controle.checked = !controle.checked;
            console.error("Não foi possível localizar o usuário selecionado.");
            return;
        }

        const statusAnterior = Boolean(usuario.status);
        const novoStatus = controle.checked;

        if (statusAnterior === novoStatus) {
            return;
        }

        controle.disabled = true;

        try {
            const resultado = await window.UsuarioApi.alterarStatusUsuario(
                id,
                novoStatus
            );

            if (!resultado) {
                controle.checked = statusAnterior;
                return;
            }

            usuario.status = novoStatus;

            const linha = controle.closest("tr");
            const celulaStatus = linha?.children[3];
            const labelStatus = controle.closest(".switchStatus");

            if (celulaStatus) {
                celulaStatus.textContent =
                    window.UsuarioFormatadores.formatarStatus(novoStatus);
            }

            if (labelStatus) {
                labelStatus.title = novoStatus ? "Inativar" : "Ativar";
            }

            controle.setAttribute(
                "aria-label",
                `${novoStatus ? "Inativar" : "Ativar"} usuário ${usuario.nome ?? ""}`
            );
        } catch (erro) {
            controle.checked = statusAnterior;
            console.error("Erro ao alterar o status do usuário:", erro);
            alert(
                erro.message || "Não foi possível alterar o status do usuário."
            );
        } finally {
            controle.disabled = false;
        }
    }

    function configurarInterface() {
        const btnAdicionar = document.getElementById("btnCadadastrar");
        const btnBuscar = document.getElementById("btnBuscar");
        const campoBusca = document.getElementById("busca");
        const tabela = document.getElementById("usuariosTable");

        btnAdicionar?.addEventListener("click", () => {
            window.ModalUsuario?.abrirCadastro();
        });

        btnBuscar?.addEventListener("click", buscarUsuarios);

        campoBusca?.addEventListener("keydown", evento => {
            if (evento.key === "Enter") {
                buscarUsuarios();
            }
        });

        tabela?.addEventListener("click", evento => {
            const botao = evento.target.closest('button[data-acao="editar"]');

            if (!botao) {
                return;
            }

            const id = Number(botao.dataset.id);
            const usuario = usuariosCarregados.find(
                item => Number(item.id) === id
            );

            if (usuario) {
                window.ModalUsuario?.abrirEdicao(usuario);
            }
        });

        tabela?.addEventListener("change", evento => {
            const alvo = evento.target;

            if (!(alvo instanceof HTMLInputElement)) {
                return;
            }

            if (alvo.matches('input[data-acao="status"]')) {
                tratarAlteracaoStatus(alvo);
            }
        });
    }

    window.carregarUsuarios = carregarUsuarios;
    window.buscarUsuarios = buscarUsuarios;

    await inicializar();
});