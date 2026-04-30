import Header from "../components/Header";
import { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { X, Check, FileText } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios"
import "./GhostPage.css"

const api_url = import.meta.env.VITE_API_URL

function GhostPage() {
    const [content, setContent] = useState("# Escreva aqui a sua notícia");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    async function HandleSaver() {
        const news = { titulo: title, descricao: description, conteudo: content }
        console.log("Enviando:", news)

        if (!title || !description || !content) {
            toast.error("Por favor, preencha todos os campos antes de publicar.");
            return
        }

        setLoading(true);

        try {
            const token = localStorage.getItem("token")
            const response = await axios.post(`${api_url}/noticias/`, news, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            })

            const data_of_response = response.data
            console.log("Notícia salva com sucesso", data_of_response)
            toast.success("Notícia salva com sucesso!");
            ClearAll()
        } catch (error) {
            console.error("Erro ao salvar notícia:", error);
            console.error("Detalhes:", error.response?.data);
            toast.error("Erro ao salvar notícia. ", error);
        } finally {
            setLoading(false);
        }
    }

    function ClearAll() {
        setContent("");
        setTitle("");
        setDescription("");
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Escrever Notícias</h1>
                    <p className="text-lg text-gray-600">Crie e publique novas notícias no portal</p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 mb-8">
                    <button
                        onClick={ClearAll}
                        className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-300 font-medium"
                        aria-label="Excluir todas as informações da notícia"
                        title="Excluir todas as informações da notícia"
                    >
                        <X className="w-5 h-5" />
                        Limpar Tudo
                    </button>

                    <button
                        onClick={HandleSaver}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-all duration-300 font-medium"
                        aria-label="Enviar notícia para o portal"
                        title="Enviar notícia para o portal"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Publicando...
                            </>
                        ) : (
                            <>
                                <Check className="w-5 h-5" />
                                Publicar
                            </>
                        )}
                    </button>
                </div>

                {/* Form Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
                    {/* Title Input */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            Título da Notícia *
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-lg font-semibold text-gray-900"
                            placeholder="Digite o título da notícia"
                            aria-label="Título principal da notícia"
                        />
                    </div>

                    {/* Description Input */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Descrição da Notícia *
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                            placeholder="Digite uma breve descrição da notícia"
                        />
                    </div>

                    {/* Content Editor */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Conteúdo da Notícia *
                        </label>
                        <div className="border border-gray-300 rounded-lg overflow-hidden">
                            <MDEditor
                                value={content}
                                onChange={setContent}
                                height={600}
                                data-color-mode="light"
                                preview="edit"
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default GhostPage;