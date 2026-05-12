import { useState } from "react";
import "./LoginADM.css";
import LoginLogo from "../components/LoginLogo";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function LoginADM() {
    const navigate = useNavigate();

    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const [lembrar, setLembrar]   = useState(false);
    const [loading, setLoading]   = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        // Validação local
        if (!email || !password) {
            toast.error("Preencha todos os campos para realizar o login!");
            return;
        }

        setLoading(true);

        try {
            // A API espera application/x-www-form-urlencoded (OAuth2PasswordRequestForm)
            const body = new URLSearchParams();
            body.append("username", email);   // FastAPI OAuth2 usa "username"
            body.append("password", password);

            const response = await fetch(`${API_URL}/admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: body.toString(),
            });

            const data = await response.json();

            if (!response.ok) {
                // data.detail vem do HTTPException do FastAPI
                toast.error(data.detail || "Erro ao realizar login.");
                return;
            }

            // Salva o token — localStorage se "lembrar", sessionStorage se não
            const storage = lembrar ? localStorage : sessionStorage;
            storage.setItem("access_token", data.access_token);
            storage.setItem("user", JSON.stringify(data.user));

            toast.success(`Bem-vindo, ${data.user.nome}!`);
            navigate("/ghostpage");

        } catch (err) {
            toast.error("Não foi possível conectar ao servidor. Tente novamente.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex h-screen min-h-screen w-full min-w-full bg-linear-to-r from-[#002057] to-[rgb(5,247,239)]">
            {/* Formulário */}
            <div className="flex flex-col w-1/2 items-center gap-10">
                <h1 className="text-4xl font-bold text-center text-white mt-40">
                    Login de Administrador
                </h1>

                <form className="w-full" onSubmit={handleSubmit}>
                    <div className="w-full text-white">
                        {/* Email */}
                        <div className="flex flex-col flex-wrap gap-1">
                            <label
                                className="ml-14 md:ml-21 lg:ml-28 xl:ml-35 2xl:ml-40 mt-5"
                                htmlFor="email"
                            >
                                Email
                            </label>
                            <input
                                className="snake-focus self-center w-2/3 h-13 border-2 border-[#00fff7] outline-none rounded-xl indent-3 bg-transparent text-white placeholder-white/50"
                                type="email"
                                id="email"
                                placeholder="example@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                disabled={loading}
                            />
                        </div>

                        {/* Senha */}
                        <div className="flex flex-col flex-wrap gap-1">
                            <label
                                className="ml-14 md:ml-21 lg:ml-28 xl:ml-35 2xl:ml-40 mt-5"
                                htmlFor="password"
                            >
                                Senha
                            </label>
                            <input
                                className="snake-focus self-center w-2/3 h-13 border-2 border-[#00fff7] outline-none rounded-xl indent-3 bg-transparent text-white placeholder-white/50"
                                type="password"
                                id="password"
                                placeholder="Digite sua senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Lembrar sessão */}
                    <div className="mt-5 text-white">
                        <label
                            htmlFor="checkbox"
                            className="flex gap-2 ml-14 md:ml-21 lg:ml-28 xl:ml-35 2xl:ml-40 cursor-pointer select-none"
                        >
                            <input
                                className="accent-[#00fff7]"
                                id="checkbox"
                                type="checkbox"
                                checked={lembrar}
                                onChange={(e) => setLembrar(e.target.checked)}
                            />
                            Lembrar sessão
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

            {/* Imagem lateral */}
            <div className="bg-slate-950 max-w-1/2 w-1/2">
                <LoginLogo />
            </div>
        </div>
    );
}

export default LoginADM;
