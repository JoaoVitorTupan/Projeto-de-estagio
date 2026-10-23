document.addEventListener("DOMContentLoaded", () => {

  window.login = async function () {

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const error = document.getElementById("error");

    error.innerText = "";

    try {
      const response = await fetch("http://localhost:3000/usuarios/login", {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          email,
          senha
        })
      });

      const data = await response.json();

      if (!response.ok) {

        error.innerText =
          data.error || "Erro ao fazer login";

        return;
      }

      localStorage.setItem(
        "usuario",
        JSON.stringify(data.usuario)
      );

      localStorage.setItem(
        "token",
        data.token
      );

      const role = data.usuario?.role ? String(data.usuario.role).toLowerCase() : "";
      if (role === "financeiro") {
        window.location.href = "../contas/conta.html";
      } else {
        window.location.href = "../dashboard/dashboard.html";
      }

    } catch (err) {

      error.innerText =
        "Erro de conexão com a API";
    }
  };

  const mostrarSenha = document.getElementById("mostrarSenha");

  const senhaInput = document.getElementById("senha");

  if (mostrarSenha && senhaInput) {

    mostrarSenha.addEventListener("click", () => {

      const isSenha =
        senhaInput.type === "password";

      senhaInput.type =
        isSenha ? "text" : "password";

      mostrarSenha.src = isSenha
        ? "../../assets/olho.png"
        : "../../assets/olho-off.png";
    });
  }
});