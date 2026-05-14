import Header from "../components/Header";
import { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { X, Check, FileText, BookOpen } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import "./GhostPage.css";

const api_url = import.meta.env.VITE_API_URL;

// ─── Formulário de Notícia ────────────────────────────────────────────────────
function NoticiaForm({ onSuccess }) {
    const [content, setContent] = useState("# Escreva aqui a sua notícia");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    function clearAll() {
        setContent("# Escreva aqui a sua notícia");
        setTitle("");
        setDescription("");
    }

    async function handleSave() {
        if (!title.trim() || !description.trim() || !content.trim()) {
            toast.error("Por favor, preencha todos os campos antes de publicar.");
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                toast.error("Você precisa estar autenticado para publicar.");
                return;
            }

            const news = { titulo: title.trim(), descricao: description.trim(), conteudo: content.trim() };

            const response = await axios.post(`${api_url}/noticias/`, news, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            console.log("Notícia salva com sucesso:", response.data);
            toast.success("Notícia publicada com sucesso!");
            clearAll();
            onSuccess?.();
        } catch (error) {
            console.error("Erro ao salvar notícia:", error);
            console.error("Detalhes:", error.response?.data);

            if (error.response?.status === 401) {
                toast.error("Sessão expirada. Faça login novamente.");
            } else if (error.response?.status === 422) {
                toast.error("Dados inválidos. Verifique os campos e tente novamente.");
            } else {
                toast.error("Erro ao salvar notícia. Tente novamente.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            {/* Title */}
            <div>
                <label htmlFor="noticia-title" className="block text-sm font-medium text-gray-700 mb-2">
                    Título da Notícia *
                </label>
                <input
                    type="text"
                    id="noticia-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-lg font-semibold text-gray-900"
                    placeholder="Digite o título da notícia"
                />
            </div>

            {/* Description */}
            <div>
                <label htmlFor="noticia-description" className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição da Notícia *
                </label>
                <textarea
                    id="noticia-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
                        height={500}
                        data-color-mode="light"
                        preview="edit"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-2">
                <button
                    onClick={clearAll}
                    className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-300 font-medium"
                >
                    <X className="w-5 h-5" />
                    Limpar Tudo
                </button>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-all duration-300 font-medium"
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Publicando...
                        </>
                    ) : (
                        <>
                            <Check className="w-5 h-5" />
                            Publicar Notícia
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

// ─── Formulário de Edital ─────────────────────────────────────────────────────
function EditalForm({ onSuccess }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [content, setContent] = useState("# Escreva aqui o edital");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    function clearAll() {
        setTitle("");
        setDescription("");
        setContent("# Escreva aqui o edital");
        setFile(null);
    }

    async function handleSave() {
        if (!title.trim() || !description.trim() || !content.trim()) {
            toast.error("Por favor, preencha todos os campos antes de publicar.");
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                toast.error("Você precisa estar autenticado para publicar.");
                return;
            }

            // Se houver arquivo PDF, enviar como multipart/form-data
            if (file) {
                const formData = new FormData();
                formData.append("titulo", title.trim());
                formData.append("descricao", description.trim());
                formData.append("conteudo", content.trim());
                formData.append("arquivo", file);

                const response = await axios.post(`${api_url}/editais/`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                });

                console.log("Edital salvo com sucesso:", response.data);
            } else {
                const edital = {
                    titulo: title.trim(),
                    descricao: description.trim(),
                    conteudo: content.trim(),
                };

                const response = await axios.post(`${api_url}/editais/`, edital, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                console.log("Edital salvo com sucesso:", response.data);
            }

            toast.success("Edital publicado com sucesso!");
            clearAll();
            onSuccess?.();
        } catch (error) {
            console.error("Erro ao salvar edital:", error);
            console.error("Detalhes:", error.response?.data);

            if (error.response?.status === 401) {
                toast.error("Sessão expirada. Faça login novamente.");
            } else if (error.response?.status === 422) {
                toast.error("Dados inválidos. Verifique os campos e tente novamente.");
            } else {
                toast.error("Erro ao salvar edital. Tente novamente.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            {/* Title */}
            <div>
                <label htmlFor="edital-title" className="block text-sm font-medium text-gray-700 mb-2">
                    Título do Edital *
                </label>
                <input
                    type="text"
                    id="edital-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-lg font-semibold text-gray-900"
                    placeholder="Digite o título do edital"
                />
            </div>

            {/* Description */}
            <div>
                <label htmlFor="edital-description" className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição do Edital *
                </label>
                <textarea
                    id="edital-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Digite uma breve descrição do edital"
                />
            </div>

            {/* PDF Upload (opcional) */}
            <div>
                <label htmlFor="edital-file" className="block text-sm font-medium text-gray-700 mb-2">
                    Arquivo PDF <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <div className="flex items-center gap-3">
                    <input
                        type="file"
                        id="edital-file"
                        accept="application/pdf"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-lg file:border-0
                            file:text-sm file:font-medium
                            file:bg-green-50 file:text-green-700
                            hover:file:bg-green-100 transition-colors cursor-pointer
                            border border-gray-300 rounded-lg p-2"
                    />
                    {file && (
                        <button
                            onClick={() => setFile(null)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="Remover arquivo"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
                {file && (
                    <p className="mt-2 text-sm text-green-600">
                        ✓ {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                )}
            </div>

            {/* Content Editor */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conteúdo do Edital *
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <MDEditor
                        value={content}
                        onChange={setContent}
                        height={500}
                        data-color-mode="light"
                        preview="edit"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-2">
                <button
                    onClick={clearAll}
                    className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-300 font-medium"
                >
                    <X className="w-5 h-5" />
                    Limpar Tudo
                </button>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-all duration-300 font-medium"
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Publicando...
                        </>
                    ) : (
                        <>
                            <Check className="w-5 h-5" />
                            Publicar Edital
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
function GhostPage() {
    const [activeTab, setActiveTab] = useState("noticia"); // "noticia" | "edital"

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Publicar Conteúdo</h1>
                    <p className="text-lg text-gray-600">Crie e publique notícias e editais no portal</p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                        <button
                            onClick={() => setActiveTab("noticia")}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                                activeTab === "noticia"
                                    ? "bg-blue-600 text-white shadow"
                                    : "text-gray-600 hover:text-blue-600"
                            }`}
                        >
                            <FileText className="w-5 h-5" />
                            Notícia
                        </button>
                        <button
                            onClick={() => setActiveTab("edital")}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                                activeTab === "edital"
                                    ? "bg-green-600 text-white shadow"
                                    : "text-gray-600 hover:text-green-600"
                            }`}
                        >
                            <BookOpen className="w-5 h-5" />
                            Edital
                        </button>
                    </div>
                </div>

                {/* Form Content */}
                {activeTab === "noticia" ? (
                    <NoticiaForm />
                ) : (
                    <EditalForm />
                )}
            </main>
        </div>
    );
}

export default GhostPage;
