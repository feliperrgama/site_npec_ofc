import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import BacktoHome from '../components/buttons/BacktoHome'
import { Upload, FileText } from 'lucide-react'
import { getToken } from '../utils/auth'

const api_url = import.meta.env.VITE_API_URL

function PostEdital() {
    const [titulo, setTitulo] = useState('')
    const [descricao, setDescricao] = useState('')
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const navigate = useNavigate()

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile && selectedFile.type !== 'application/pdf') {
            setError('Apenas arquivos PDF são permitidos')
            setFile(null)
            return
        }
        setFile(selectedFile)
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!titulo || !file) {
            setError('Título e arquivo são obrigatórios')
            return
        }

        const token = getToken()
        if (!token) {
            setError('Sessão expirada. Faça login novamente.')
            return
        }

        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const formData = new FormData()
            formData.append('titulo', titulo)
            formData.append('descricao', descricao)
            formData.append('file', file)

            await axios.post(`${api_url}/documentos/`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            })

            setSuccess('Edital postado com sucesso!')
            setTitulo('')
            setDescricao('')
            setFile(null)

            const fileInput = document.getElementById('file-input')
            if (fileInput) fileInput.value = ''

            setTimeout(() => {
                navigate('/page_editais')
            }, 2000)

        } catch (error) {
            console.error('Erro ao postar edital:', error)
            if (error.response?.status === 401) {
                setError('Sessão expirada. Faça login novamente.')
            } else if (error.response?.status === 422) {
                setError('Dados inválidos. Verifique os campos e tente novamente.')
            } else {
                setError(error.response?.data?.detail || 'Erro ao postar edital')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="container mx-auto px-4 py-12 max-w-2xl">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <Upload className="w-8 h-8 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Postar Edital</h1>
                        <p className="text-gray-600">Faça upload de um novo edital em PDF</p>
                    </div>

                    {error && (
                        <div role="alert" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div role="status" className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-2">
                                Título do Edital *
                            </label>
                            <input
                                type="text"
                                id="titulo"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                disabled={loading}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-60"
                                placeholder="Digite o título do edital"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-2">
                                Descrição (opcional)
                            </label>
                            <textarea
                                id="descricao"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                rows={4}
                                disabled={loading}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none disabled:opacity-60"
                                placeholder="Descreva brevemente o edital"
                            />
                        </div>

                        <div>
                            <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 mb-2">
                                Arquivo PDF *
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    id="file-input"
                                    accept=".pdf,application/pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    required
                                />
                                <label
                                    htmlFor="file-input"
                                    className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                        file
                                            ? 'border-green-400 bg-green-50 hover:border-green-500'
                                            : 'border-gray-300 hover:border-blue-400'
                                    }`}
                                >
                                    <div className="text-center">
                                        <FileText className={`w-8 h-8 mx-auto mb-2 ${file ? 'text-green-500' : 'text-gray-400'}`} />
                                        <p className={`text-sm ${file ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                                            {file ? `✓ ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)` : 'Clique para selecionar um arquivo PDF'}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">Máximo 10MB</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Postando...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    Postar Edital
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-8">
                    <BacktoHome />
                </div>
            </main>

            <Footer />
        </div>
    )
}

export default PostEdital
