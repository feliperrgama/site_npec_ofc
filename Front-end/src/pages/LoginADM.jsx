import { useState } from "react";
import "./LoginADM.css";
import LoginLogo from "../components/LoginLogo";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function LoginADM() {
    const inputs = [
        { label: "Email", type: "email", id: "email", placeholder: "example@email.com" },
        { label: "Senha", type: "password", id: "password", placeholder: "Digite sua senha" },
    ];

    const [marked, setMarked] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    function getValueById(id) {
        return id === "email" ? email : password;
    }

    function setValueById(id, value) {
        if (id === "email") setEmail(value);
        else setPassword(value);
    }

    async function HandlerStorage(e) {
        e.preventDefault();

        if (!email || !password) {
            toast.error("É necessário preencher todos os campos para realizar o login!");
            return;
        }

        setLoading(true);

        try {
            // A API usa OAuth2PasswordRequestForm: envia como form-data (não JSON)
            const formData = new URLSearchParams();
            formData.append("username", email);
            formData.append("password", password);

            const response = await fetch(`${API_URL}/admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: formData.toString(),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.detail || "Credenciais inválidas. Tente novamente.");
                return;
            }

            // Salva token e dados do usuário
            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("user", JSON.stringify(data.user));

            if (marked) {
                localStorage.setItem("saved_email", email);
            } else {
                localStorage.removeItem("saved_email");
            }

            toast.success(`Bem-vindo, ${data.user.nome}!`);
            navigate("/ghostpage");
        } catch (err) {
            toast.error("Erro de conexão com o servidor. Tente novamente.");
            console.error("Erro no login:", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex h-screen min-h-screen w-full min-w-full bg-linear-to-r from-[#002057] to-[rgb(5,247,239)]">
            {/* Div do formulário de login */}
            <div className="flex flex-col w-1/2 items-center gap-10">
                <h1 className="text-4xl font-bold text-center text-white mt-40">
                    Login de Administrador
                </h1>

                {/* Formulário de login para administrador */}
                <form action="submit" className="w-full" onSubmit={HandlerStorage}>
                    <div className="w-full text-white">
                        {inputs.map((input) => (
                            <div key={input.id} className="flex flex-col flex-wrap gap-1">
                                <label
                                    className="ml-14 md:ml-21 lg:ml-28 xl:ml-35 2xl:ml-40 mt-5"
                                    htmlFor={input.id}
                                >
                                    {input.label}
                                </label>
                                <input
                                    className="snake-focus self-center w-2/3 h-13 border-2 border-[#00fff7] outline-none rounded-xl indent-3"
                                    type={input.type}
                                    id={input.id}
                                    placeholder={input.placeholder}
                                    value={getValueById(input.id)}
                                    onChange={(e) => setValueById(input.id, e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 text-white">
                        <label
                            htmlFor="checkbox"
                            className="flex gap-2 ml-14 md:ml-21 lg:ml-28 xl:ml-35 2xl:ml-40"
                        >
                            <input
                                className="accent-[#00fff7]"
                                id="checkbox"
                                type="checkbox"
                                checked={marked}
                                onChange={(e) => setMarked(e.target.checked)}
                            />
                            Salvar senha
                        </label>
                    </div>

                    <div className="flex justify-center w-full text-white">
                        <button
                            className="bt w-2/3 h-13 rounded-2xl cursor-pointer active:scale-90 transition-all duration-700 mt-10 disabled:opacity-50 disabled:cursor-not-allowed"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Entrando..." : "Entrar"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Imagem lateral direita, ao lado do formulário */}
            <div className="bg-slate-950 max-w-1/2 w-1/2">
                <LoginLogo />
            </div>
        </div>
    );
}

export default LoginADM;
