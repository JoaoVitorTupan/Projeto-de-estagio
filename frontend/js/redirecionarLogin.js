function checkAuth() {
    const token = localStorage.getItem("token");

    if (token) {
        let perfil = "";
        try {
            const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
            perfil = usuario?.role ? String(usuario.role).toLowerCase() : "";
        } catch {}

        if (perfil === "financeiro") {
            window.location.replace("pages/contas/conta.html");
        } else {
            window.location.replace("pages/dashboard/dashboard.html");
        }
    } else {
        window.location.replace("pages/autenticacao/login.html");
    }
}

checkAuth();