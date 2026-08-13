import Header from "../components/Header";
import { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { X, Check, FileText, BookOpen } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { getToken, clearSession } from "../utils/auth";
import "./GhostPage.css";

const api_url = import.meta.env.VITE_API_URL || "http://localhost:8000";
// Mesma variável e fallback usados em App.jsx — precisa ficar em sincronia,
// ou o redirecionamento por sessão expirada leva a uma rota inexistente.
const loginadm_route = import.meta.env.VITE_LOGIN_PAGE_ROUTE || "/loginadm";

// ─── Formulário de Notícia ────────────────────────────────────────────────────
function NoticiaForm() {
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

        const token = getToken();
        if (!token) {
            toast.error("Sessão expirada. Faça login novamente.");
            return;
        }

        setLoading(true);

        try {
            // Backend usa Form(...), então enviamos FormData (multipart/form-data)
            const formData = new FormData();
            formData.append("titulo", title.trim());
            formData.append("descricao", description.trim());
            formData.append("conteudo", content.trim());

            await axios.post(`${api_url}/noticias/`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    // NÃO definir Content-Type — o axios define automaticamente
                    // com o boundary correto para multipart/form-data
                },
            });

            toast.success("Notícia publicada com sucesso!");
            clearAll();
        } catch (error) {
            console.error("Erro ao salvar notícia:", error.response?.data || error);

            if (error.response?.status === 401) {
                toast.error("Sessão expirada. Faça login novamente.");
                clearSession();
                window.location.href = loginadm_route;
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
            <div>
                <label htmlFor="noticia-title" className="block text-sm font-medium text-gray-700 mb-2">
                    Título da Notícia *
                </label>
                <input
                    type="text"
                    id="noticia-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-lg font-semibold text-gray-900 disabled:opacity-60"
                    placeholder="Digite o título da notícia"
                />
            </div>

            <div>
                <label htmlFor="noticia-description" className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição da Notícia *
                </label>
                <textarea
                    id="noticia-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none disabled:opacity-60"
                    placeholder="Digite uma breve descrição da notícia"
                />
            </div>

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

            <div className="flex justify-end gap-4 pt-2">
                <button
                    onClick={clearAll}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-300 font-medium disabled:opacity-50"
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
function EditalForm() {
    const [titulo, setTitulo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    function clearAll() {
        setTitulo("");
        setDescricao("");
        setFile(null);
        const fileInput = document.getElementById("edital-file");
        if (fileInput) fileInput.value = "";
    }

    function handleFileChange(e) {
        const selected = e.target.files?.[0];
        if (selected && selected.type !== "application/pdf") {
            toast.error("Apenas arquivos PDF são permitidos.");
            setFile(null);
            return;
        }
        setFile(selected || null);
    }

    async function handleSave() {
        if (!titulo.trim()) {
            toast.error("O título do edital é obrigatório.");
            return;
        }
        if (!file) {
            toast.error("Selecione um arquivo PDF para o edital.");
            return;
        }

        const token = getToken();
        if (!token) {
            toast.error("Sessão expirada. Faça login novamente.");
            return;
        }

        setLoading(true);

        try {
            // Backend usa Form(...) + File(...), então enviamos FormData
            const formData = new FormData();
            formData.append("titulo", titulo.trim());
            formData.append("descricao", descricao.trim());
            formData.append("file", file);

            await axios.post(`${api_url}/documentos/`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    // NÃO definir Content-Type — o axios define automaticamente
                },
            });

            toast.success("Edital publicado com sucesso!");
            clearAll();
        } catch (error) {
            console.error("Erro ao salvar edital:", error.response?.data || error);

            if (error.response?.status === 401) {
                toast.error("Sessão expirada. Faça login novamente.");
                clearSession();
                window.location.href = loginadm_route;
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
            <div>
                <label htmlFor="edital-title" className="block text-sm font-medium text-gray-700 mb-2">
                    Título do Edital *
                </label>
                <input
                    type="text"
                    id="edital-title"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-lg font-semibold text-gray-900 disabled:opacity-60"
                    placeholder="Digite o título do edital"
                />
            </div>

            <div>
                <label htmlFor="edital-description" className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <textarea
                    id="edital-description"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    rows={4}
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none disabled:opacity-60"
                    placeholder="Descreva brevemente o edital"
                />
            </div>

            <div>
                <label htmlFor="edital-file" className="block text-sm font-medium text-gray-700 mb-2">
                    Arquivo PDF *
                </label>
                <div className="relative">
                    <input
                        type="file"
                        id="edital-file"
                        accept=".pdf,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <label
                        htmlFor="edital-file"
                        className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                            file
                                ? "border-green-400 bg-green-50 hover:border-green-500"
                                : "border-gray-300 hover:border-green-400"
                        }`}
                    >
                        <div className="text-center">
                            <FileText className={`w-8 h-8 mx-auto mb-2 ${file ? "text-green-500" : "text-gray-400"}`} />
                            <p className={`text-sm ${file ? "text-green-700 font-medium" : "text-gray-600"}`}>
                                {file
                                    ? `✓ ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`
                                    : "Clique para selecionar um arquivo PDF"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Máximo 10MB</p>
                        </div>
                    </label>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-2">
                <button
                    onClick={clearAll}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-300 font-medium disabled:opacity-50"
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
    const [activeTab, setActiveTab] = useState("noticia");

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Publicar Conteúdo</h1>
                    <p className="text-lg text-gray-600">Crie e publique notícias e editais no portal</p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm" role="tablist" aria-label="Tipo de conteúdo">
                        <button
                            role="tab"
                            aria-selected={activeTab === "noticia"}
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
                            role="tab"
                            aria-selected={activeTab === "edital"}
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

                {activeTab === "noticia" ? <NoticiaForm /> : <EditalForm />}
            </main>
        </div>
    );
}

export default GhostPage;
