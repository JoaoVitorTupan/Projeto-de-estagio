const newSenhaInput = document.getElementById("newSenha");
const mostrarNewSenha = document.getElementById("mostrarNewSenha");

mostrarNewSenha.addEventListener("click", () => {
  if (newSenhaInput.type === "password") {
    newSenhaInput.type = "text";
    mostrarNewSenha.src = "../../assets/olho.png";
  } else {
    newSenhaInput.type = "password";
    mostrarNewSenha.src = "../../assets/olho-off.png";
  }
});

const confirmSenhaInput = document.getElementById("confirmSenha");
const mostrarConfirmSenha = document.getElementById("mostrarConfirmSenha");

mostrarConfirmSenha.addEventListener("click", () => {
  if (confirmSenhaInput.type === "password") {
    confirmSenhaInput.type = "text";
    mostrarConfirmSenha.src = "../../assets/olho.png";
  } else {
    confirmSenhaInput.type = "password";
    mostrarConfirmSenha.src = "../../assets/olho-off.png";
  }
});


async function redefinirSenha() {
  const email = document.getElementById("email").value;
  const newSenha = newSenhaInput.value;
  const confirmSenha = confirmSenhaInput.value;
  const error = document.getElementById("error");

  error.innerText = "";

  if (!email || !newSenha || !confirmSenha) {
    error.innerText = "Preencha todos os campos";
    return;
  }

  if (newSenha !== confirmSenha) {
    error.innerText = "As senhas não coincidem";
    return;
  }

  if (newSenha.length < 8) {
    error.innerText = "A senha deve ter no mínimo 8 caracteres";
    return;
  }
  try {
    const response = await fetch("http://localhost:3000/usuarios/redefinir-senha", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        newSenha,
        confirmSenha
      })
    });

    const data = await response.json();

    if (!response.ok) {
      error.innerText = data.message;
      return;
    }

    alert("Senha redefinida com sucesso!");
    window.location.href = "login.html";

  } catch (error) {
    error.innerText = "Erro de conexão com a API";
  }
}
