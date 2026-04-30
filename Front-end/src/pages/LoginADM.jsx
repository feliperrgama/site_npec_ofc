// import { useState } from "react";
import "./LoginADM.css"
import { LogIn, Mail, Lock } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const api_url = import.meta.env.VITE_API_URL

function LoginADM() {
    const navigate = useNavigate()

    async function HandlerStorage(e) {
        e.preventDefault()

        const email = document.getElementById("email").value
        const password = document.getElementById("password").value

        if (!email || !password) {
            toast.error("É necessário preencher todos os campos para realizar o login!")
            return
        }

        try {
            const formData = new URLSearchParams()
            formData.append("username", email)
            formData.append("password", password)

            const response = await axios.post(`${api_url}/admin/login`, formData, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            })

            const { access_token } = response.data
            localStorage.setItem("token", access_token)

            toast.success("Login realizado com sucesso!")

            navigate('/admin/dashboard')

        } catch (error) {
            if (error.response?.status === 401) {
                toast.error("E-mail ou senha incorretos.")
            } else {
                console.log(error)
                toast.error("Erro ao realizar login. Tente novamente mais tarde.")
            }
            console.error(error)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                        <LogIn className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Login Administrativo</h1>
                    <p className="text-gray-600">Acesse o painel de administração do portal</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form onSubmit={HandlerStorage} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                E-mail
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Senha
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    id="password"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="Digite sua senha"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
                        >
                            <LogIn className="w-5 h-5" />
                            Entrar
                        </button>
                    </form>

                    {/* Footer Text */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            Acesso restrito aos administradores do sistema
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginADM;