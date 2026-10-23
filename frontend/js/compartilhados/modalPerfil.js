(function () {
    "use strict";

    const CAMINHO_HTML = "../usuarios/perfil.html";
    const CAMINHO_CSS = "../../css/usuarios/perfil.css";
    const CAMINHO_JS = "../../js/usuarios/perfil.js";

    const ID_CONTAINER = "containerModais";
    const ID_MODAL = "modalPerfil";
    const ID_CSS = "cssModalPerfilCompartilhado";
    const ID_SCRIPT = "scriptPerfilCompartilhado";

    let aberturaEmAndamento = null;

    function obterContainer() {
        let container = document.getElementById(ID_CONTAINER);

        if (!container) {
            container = document.createElement("div");
            container.id = ID_CONTAINER;
            document.body.appendChild(container);
        }

        return container;
    }

    function carregarCSS() {
        if (document.getElementById(ID_CSS)) {
            return;
        }

        const link = document.createElement("link");

        link.id = ID_CSS;
        link.rel = "stylesheet";
        link.href = CAMINHO_CSS;

        document.head.appendChild(link);
    }

    function carregarScript() {
        if (window.Perfil) {
            return Promise.resolve();
        }

        const existente = document.getElementById(ID_SCRIPT);

        if (existente) {
            if (existente.dataset.carregado === "true") {
                return window.Perfil
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error("O módulo de perfil não foi inicializado.")
                    );
            }

            return new Promise((resolve, reject) => {
                existente.addEventListener("load", () => {
                    if (window.Perfil) {
                        resolve();
                    } else {
                        reject(
                            new Error("O módulo de perfil não foi inicializado.")
                        );
                    }
                }, { once: true });

                existente.addEventListener("error", () => {
                    existente.remove();
                    reject(
                        new Error("Não foi possível carregar o módulo de perfil.")
                    );
                }, { once: true });
            });
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement("script");

            script.id = ID_SCRIPT;
            script.src = CAMINHO_JS;
            script.async = false;

            script.addEventListener("load", () => {
                script.dataset.carregado = "true";

                if (window.Perfil) {
                    resolve();
                } else {
                    script.remove();
                    reject(
                        new Error("O módulo de perfil não foi inicializado.")
                    );
                }
            }, { once: true });

            script.addEventListener("error", () => {
                script.remove();
                reject(
                    new Error("Não foi possível carregar o módulo de perfil.")
                );
            }, { once: true });

            document.body.appendChild(script);
        });
    }

    async function carregarHTML() {
        const container = obterContainer();

        const resposta = await fetch(CAMINHO_HTML);

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar a modal de perfil.");
        }

        const html = await resposta.text();
        const documento = new DOMParser().parseFromString(html, "text/html");
        const modal = documento.getElementById(ID_MODAL);

        if (!modal) {
            throw new Error("A estrutura HTML da modal de perfil é inválida.");
        }

        container.appendChild(modal);

        return modal;
    }

    async function executarAbertura() {
        if (!window.Autenticacao) {
            throw new Error("O módulo de autenticação não foi carregado.");
        }

        if (!window.Autenticacao.estaAutenticado()) {
            window.Autenticacao.redirecionarParaLogin();
            return false;
        }

        carregarCSS();

        let modal = document.getElementById(ID_MODAL);

        if (!modal) {
            modal = await carregarHTML();
        }

        await carregarScript();

        const inicializado = await window.Perfil.inicializar();

        if (!inicializado) {
            modal.remove();
            return false;
        }

        return true;
    }

    async function abrir() {
        if (aberturaEmAndamento) {
            return aberturaEmAndamento;
        }

        aberturaEmAndamento = executarAbertura();

        try {
            return await aberturaEmAndamento;
        } catch (erro) {
            console.error("Erro ao abrir a modal de perfil:", erro);

            document.getElementById(ID_MODAL)?.remove();

            alert("Não foi possível abrir o perfil do usuário.");

            return false;
        } finally {
            aberturaEmAndamento = null;
        }
    }

    function fechar() {
        if (window.Perfil) {
            window.Perfil.fecharModal();
            return;
        }

        document.getElementById(ID_MODAL)?.remove();
    }

    function configurarEventos() {
        document.addEventListener("click", evento => {
            if (!(evento.target instanceof Element)) {
                return;
            }

            const acionador = evento.target.closest(
                "#abrirPerfil, [data-abrir-perfil]"
            );

            if (!acionador) {
                return;
            }

            evento.preventDefault();
            evento.stopPropagation();

            abrir();
        }, true);
    }

    window.ModalPerfil = Object.freeze({
        inicializar: configurarEventos,
        abrir,
        fechar
    });

    configurarEventos();
})();