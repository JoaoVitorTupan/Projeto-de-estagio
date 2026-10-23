const params = new URLSearchParams(window.location.search);
const mensagem = params.get("msg") || "Erro inesperado.";

document.getElementById("mensagem").innerText = mensagem;