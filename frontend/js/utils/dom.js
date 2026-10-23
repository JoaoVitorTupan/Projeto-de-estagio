(function () {
    "use strict";

    function obterElemento(id) {
        return document.getElementById(id);
    }

    function selecionarTodos(seletor) {
        return Array.from(document.querySelectorAll(seletor));
    }

    function limparElemento(elemento) {
        if (elemento) {
            elemento.innerHTML = "";
        }
    }

    function mostrar(elemento, display = "block") {
        if (elemento) {
            elemento.style.display = display;
        }
    }

    function esconder(elemento) {
        if (elemento) {
            elemento.style.display = "none";
        }
    }

    function adicionarClasse(elemento, classe) {
        elemento?.classList.add(classe);
    }

    function removerClasse(elemento, classe) {
        elemento?.classList.remove(classe);
    }

    function definirTexto(elemento, texto) {
        if (elemento) {
            elemento.textContent = texto ?? "";
        }
    }

    function carregarCSS(id, href) {
        if (document.getElementById(id)) {
            return;
        }

        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
    }

    function carregarScript(id, src) {
        return new Promise((resolve, reject) => {
            const scriptExistente = document.getElementById(id);

            if (scriptExistente) {
                if (scriptExistente.dataset.carregado === "true") {
                    resolve();
                } else {
                    scriptExistente.addEventListener("load", resolve, { once: true });
                    scriptExistente.addEventListener(
                        "error",
                        () => reject(new Error(`Não foi possível carregar o script ${src}.`)),
                        { once: true }
                    );
                }
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
                () => reject(new Error(`Não foi possível carregar o script ${src}.`)),
                { once: true }
            );

            document.body.appendChild(script);
        });
    }

    window.DOM = Object.freeze({
        obterElemento,
        selecionarTodos,
        limparElemento,
        mostrar,
        esconder,
        adicionarClasse,
        removerClasse,
        definirTexto,
        carregarCSS,
        carregarScript
    });
})();