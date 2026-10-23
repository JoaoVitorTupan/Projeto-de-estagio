(function () {
    "use strict";

    function somenteNumeros(valor) {
        return window.ClienteFornecedorFormatadores.somenteNumeros(valor);
    }

    function validarCPF(cpf) {
        cpf = somenteNumeros(cpf);

        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
            return false;
        }

        let soma = 0;

        for (let i = 0; i < 9; i++) {
            soma += Number(cpf.charAt(i)) * (10 - i);
        }

        let resto = (soma * 10) % 11;

        if (resto === 10) {
            resto = 0;
        }

        if (resto !== Number(cpf.charAt(9))) {
            return false;
        }

        soma = 0;

        for (let i = 0; i < 10; i++) {
            soma += Number(cpf.charAt(i)) * (11 - i);
        }

        resto = (soma * 10) % 11;

        if (resto === 10) {
            resto = 0;
        }

        return resto === Number(cpf.charAt(10));
    }

    function validarCNPJ(cnpj) {
        cnpj = somenteNumeros(cnpj);

        if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
            return false;
        }

        function calcularDigito(numero, tamanho) {
            let soma = 0;
            let posicao = tamanho - 7;

            for (let i = tamanho; i >= 1; i--) {
                soma += Number(numero.charAt(tamanho - i)) * posicao;
                posicao--;

                if (posicao < 2) {
                    posicao = 9;
                }
            }

            const resultado = soma % 11;
            return resultado < 2 ? 0 : 11 - resultado;
        }

        const primeiroDigito = calcularDigito(cnpj, 12);

        if (primeiroDigito !== Number(cnpj.charAt(12))) {
            return false;
        }

        const segundoDigito = calcularDigito(cnpj, 13);

        return segundoDigito === Number(cnpj.charAt(13));
    }

    function validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        return regex.test(String(email ?? "").trim());
    }

    function validarTelefone(telefone) {
        const numeros = somenteNumeros(telefone);
        return numeros.length === 10 || numeros.length === 11;
    }

    function validarDadosPrincipais() {
        const formulario = window.ClienteFornecedorFormulario;
        const campos = formulario.obterCampos();

        let valido = true;

        const tipo = campos.tipo?.value || "";
        const nome = campos.nome?.value.trim() || "";
        const telefone = campos.telefone?.value || "";
        const email = campos.email?.value.trim() || "";
        const documento = campos.documento?.value || "";

        if (!tipo) {
            formulario.mostrarErro("tipo", "Selecione o tipo.");
            valido = false;
        } else {
            formulario.removerErro("tipo");
        }

        if (nome.length < 2) {
            formulario.mostrarErro("nome", "Informe o nome.");
            valido = false;
        } else {
            formulario.removerErro("nome");
        }

        if (!validarTelefone(telefone)) {
            formulario.mostrarErro("telefone", "Informe um telefone válido.");
            valido = false;
        } else {
            formulario.removerErro("telefone");
        }

        if (!validarEmail(email)) {
            formulario.mostrarErro("email", "Informe um e-mail válido.");
            valido = false;
        } else {
            formulario.removerErro("email");
        }

        if (campos.selecionarCpf?.checked) {
            if (!validarCPF(documento)) {
                formulario.mostrarErro("documento", "Informe um CPF válido.");
                valido = false;
            } else {
                formulario.removerErro("documento");
            }
        } else if (!validarCNPJ(documento)) {
            formulario.mostrarErro("documento", "Informe um CNPJ válido.");
            valido = false;
        } else {
            formulario.removerErro("documento");
        }

        return valido;
    }

    function validarEndereco() {
        const formulario = window.ClienteFornecedorFormulario;
        const campos = formulario.obterCampos();

        let valido = true;

        const cep = somenteNumeros(campos.cep?.value || "");
        const logradouro = campos.logradouro?.value.trim() || "";
        const numero = campos.numero?.value.trim() || "";
        const bairro = campos.bairro?.value.trim() || "";
        const cidade = campos.cidade?.value.trim() || "";
        const uf = campos.uf?.value || "";

        const regras = [
            {
                valido: cep.length === 8,
                campo: "cep",
                mensagem: "Informe um CEP válido."
            },
            {
                valido: Boolean(logradouro),
                campo: "logradouro",
                mensagem: "Informe o logradouro."
            },
            {
                valido: Boolean(numero),
                campo: "numero",
                mensagem: "Informe o número."
            },
            {
                valido: Boolean(bairro),
                campo: "bairro",
                mensagem: "Informe o bairro."
            },
            {
                valido: Boolean(cidade),
                campo: "cidade",
                mensagem: "Informe a cidade."
            },
            {
                valido: Boolean(uf),
                campo: "uf",
                mensagem: "Informe a UF."
            }
        ];

        regras.forEach((regra) => {
            if (!regra.valido) {
                formulario.mostrarErro(regra.campo, regra.mensagem);
                valido = false;
            } else {
                formulario.removerErro(regra.campo);
            }
        });

        return valido;
    }

    function validarFormulario() {
        const dadosPrincipaisValidos = validarDadosPrincipais();
        const enderecoValido = validarEndereco();

        return dadosPrincipaisValidos && enderecoValido;
    }

    window.ClienteFornecedorValidacao = Object.freeze({
        validarCPF,
        validarCNPJ,
        validarEmail,
        validarTelefone,
        validarDadosPrincipais,
        validarEndereco,
        validarFormulario
    });
})();