(function () {
    "use strict";

    let camposCache = null;

    function obterCampos() {
        if (camposCache) {
            return camposCache;
        }

        camposCache = {
            tipo: document.getElementById("tipo"),
            nome: document.getElementById("nome"),
            telefone: document.getElementById("telefone"),
            email: document.getElementById("email"),
            documento: document.getElementById("documento"),
            cep: document.getElementById("cep"),
            logradouro: document.getElementById("logradouro"),
            numero: document.getElementById("numero"),
            complemento: document.getElementById("complemento"),
            bairro: document.getElementById("bairro"),
            cidade: document.getElementById("cidade"),
            uf: document.getElementById("uf"),
            selecionarCpf: document.getElementById("selecionarCpf"),
            selecionarCnpj: document.getElementById("selecionarCnpj"),
            statusCep: document.getElementById("statusCep")
        };

        return camposCache;
    }

    function limparCache() {
        camposCache = null;
    }

    function obterDados() {
        const campos = obterCampos();
        const formatadores = window.ClienteFornecedorFormatadores;

        return {
            tipo: campos.tipo?.value || "",
            nome: campos.nome?.value.trim() || "",
            cpf_cnpj: formatadores.somenteNumeros(campos.documento?.value || ""),
            email: campos.email?.value.trim() || "",
            telefone: campos.telefone?.value || "",
            cep: formatadores.somenteNumeros(campos.cep?.value || ""),
            logradouro: campos.logradouro?.value.trim() || "",
            numero: campos.numero?.value.trim() || "",
            complemento: campos.complemento?.value.trim() || "",
            bairro: campos.bairro?.value.trim() || "",
            cidade: campos.cidade?.value.trim() || "",
            uf: campos.uf?.value || ""
        };
    }

    function obterTipoDocumento() {
        const campos = obterCampos();
        return campos.selecionarCpf?.checked ? "cpf" : "cnpj";
    }

    function limparErros() {
        document
            .querySelectorAll("#modalOverlay .error-message")
            .forEach((elemento) => elemento.classList.remove("active"));

        document
            .querySelectorAll("#modalOverlay input, #modalOverlay select")
            .forEach((campo) => campo.classList.remove("error"));
    }

    function limparStatusCep() {
        const campos = obterCampos();

        if (campos.statusCep) {
            campos.statusCep.textContent = "";
            campos.statusCep.className = "cep-status";
        }
    }

    function preencherDados(registro) {
        if (!registro) {
            return;
        }

        const campos = obterCampos();
        const formatadores = window.ClienteFornecedorFormatadores;
        const endereco = registro.endereco || {};

        if (campos.tipo) campos.tipo.value = registro.tipo || "";
        if (campos.nome) campos.nome.value = registro.nome || "";
        if (campos.email) campos.email.value = registro.email || "";

        if (campos.telefone) {
            campos.telefone.value = formatadores.formatarTelefone(
                registro.telefone || ""
            );
        }

        const documento = formatadores.somenteNumeros(
            registro.cpf_cnpj || registro.documento || ""
        );

        if (documento.length === 11) {
            if (campos.selecionarCpf) campos.selecionarCpf.checked = true;
            if (campos.selecionarCnpj) campos.selecionarCnpj.checked = false;
        } else if (documento.length === 14) {
            if (campos.selecionarCpf) campos.selecionarCpf.checked = false;
            if (campos.selecionarCnpj) campos.selecionarCnpj.checked = true;
        }

        if (campos.documento) {
            campos.documento.value = documento;
        }

        aplicarMascaraDocumento();

        const valoresEndereco = {
            cep: registro.cep || endereco.cep || "",
            logradouro: registro.logradouro || endereco.logradouro || "",
            numero: registro.numero || endereco.numero || "",
            complemento: registro.complemento || endereco.complemento || "",
            bairro: registro.bairro || endereco.bairro || "",
            cidade: registro.cidade || endereco.cidade || "",
            uf: registro.uf || endereco.uf || ""
        };

        if (campos.cep) {
            campos.cep.value = formatadores.formatarCep(valoresEndereco.cep);
        }

        if (campos.logradouro) campos.logradouro.value = valoresEndereco.logradouro;
        if (campos.numero) campos.numero.value = valoresEndereco.numero;
        if (campos.complemento) campos.complemento.value = valoresEndereco.complemento;
        if (campos.bairro) campos.bairro.value = valoresEndereco.bairro;
        if (campos.cidade) campos.cidade.value = valoresEndereco.cidade;
        if (campos.uf) campos.uf.value = valoresEndereco.uf;

        limparErros();
        limparStatusCep();
    }

    function limparFormulario() {
        const campos = obterCampos();

        document
            .querySelectorAll("#modalOverlay input, #modalOverlay select")
            .forEach((campo) => {
                if (campo.type !== "checkbox" && campo.type !== "radio") {
                    campo.value = "";
                }
            });

        if (campos.selecionarCpf) campos.selecionarCpf.checked = true;
        if (campos.selecionarCnpj) campos.selecionarCnpj.checked = false;

        if (campos.documento) {
            campos.documento.value = "";
        }

        if (campos.cep) {
            campos.cep.value = "";
        }

        if (campos.statusCep) {
            campos.statusCep.textContent = "";
            campos.statusCep.className = "cep-status";
        }

        if (campos.cep) {
            campos.cep.disabled = false;
        }

        limparErros();
        aplicarMascaraDocumento();
    }

    function aplicarMascaraDocumento() {
        const campos = obterCampos();
        const formatadores = window.ClienteFornecedorFormatadores;

        if (!campos.documento) {
            return;
        }

        if (campos.selecionarCpf?.checked) {
            campos.documento.value = formatadores.formatarCPF(
                campos.documento.value
            );
            campos.documento.placeholder = "000.000.000-00";
            campos.documento.maxLength = 14;
        } else {
            campos.documento.value = formatadores.formatarCNPJ(
                campos.documento.value
            );
            campos.documento.placeholder = "00.000.000/0000-00";
            campos.documento.maxLength = 18;
        }
    }

    function mostrarErro(id, mensagem) {
        const erro = document.getElementById(`${id}Erro`);

        if (erro) {
            if (mensagem) {
                erro.textContent = mensagem;
            }

            erro.classList.add("active");
        }

        const campo = document.getElementById(id);

        if (campo) {
            campo.classList.add("error");
        }
    }

    function removerErro(id) {
        const erro = document.getElementById(`${id}Erro`);

        if (erro) {
            erro.classList.remove("active");
        }

        const campo = document.getElementById(id);

        if (campo) {
            campo.classList.remove("error");
        }
    }

    window.ClienteFornecedorFormulario = Object.freeze({
        obterCampos,
        limparCache,
        obterDados,
        obterTipoDocumento,
        limparErros,
        limparStatusCep,
        preencherDados,
        limparFormulario,
        aplicarMascaraDocumento,
        mostrarErro,
        removerErro
    });
})();