import { useState, useEffect } from 'react'
import axios from 'axios'
import Header from '../components/Header'
import Footer from '../components/Footer'
import BacktoHome from '../components/buttons/BacktoHome'
import { Trash2, AlertCircle, Inbox } from 'lucide-react'
import { authHeader } from '../utils/auth'

const api_url = import.meta.env.VITE_API_URL

function DeleteNews() {
    const [noticias, setNoticias] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        const fetchNoticias = async () => {
            try {
                const response = await axios.get(`${api_url}/noticias/`)
                setNoticias(response.data)
            } catch (err) {
                console.error('Erro ao buscar notícias:', err)
                setError('Não foi possível carregar as notícias. Tente novamente em instantes.')
            } finally {
                setLoading(false)
            }
        }

        fetchNoticias()
    }, [])

    const handleDelete = async (noticiaId) => {
        setDeleting(true)
        setError('')

        try {
            // Antes: localStorage.getItem('token') — chave inexistente, então
            // o header Authorization ia vazio e o backend rejeitava a exclusão.
            await axios.delete(`${api_url}/noticias/${noticiaId}`, {
                headers: authHeader(),
            })
            setNoticias((prev) => prev.filter((n) => n.id !== noticiaId))
            setDeleteConfirm(null)
        } catch (err) {
            console.error('Erro ao deletar notícia:', err)
            if (err.response?.status === 401) {
                setError('Sessão expirada. Faça login novamente para remover notícias.')
            } else {
                setError('Erro ao deletar notícia. Verifique se você tem permissão.')
            }
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="bg-slate-50 min-h-screen text-slate-900">
            <Header />

            <main className="container mx-auto px-4 py-16">
                <section className="mx-auto max-w-4xl mb-12">
                    <div className="text-center space-y-4 mb-12">
                        <h1 className="text-4xl font-semibold text-[#002057]">Remover Notícias</h1>
                        <p className="text-slate-600 leading-8">Selecione uma notícia para removê-la do portal. Esta ação não pode ser desfeita.</p>
                    </div>

                    {error && (
                        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 mb-8 text-red-700 flex gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p>{error}</p>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block w-8 h-8 border-4 border-[#002057] border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-4 text-slate-600">Carregando notícias...</p>
                        </div>
                    ) : noticias.length === 0 ? (
                        <div className="text-center py-16 rounded-2xl border border-dashed border-slate-300 bg-white">
                            <Inbox className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-600 font-medium">Nenhuma notícia encontrada.</p>
                            <p className="text-sm text-slate-400 mt-1">Notícias publicadas aparecerão aqui.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {noticias.map((noticia) => (
                                <div key={noticia.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
                                    <div className="flex items-start justify-between gap-6">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-slate-900 mb-2">{noticia.titulo}</h3>
                                            <p className="text-sm text-slate-600 mb-3 line-clamp-2">{noticia.descricao}</p>
                                            <time className="text-xs text-slate-500">
                                                {new Date(noticia.criado_em).toLocaleDateString('pt-BR')}
                                            </time>
                                        </div>
                                        <button
                                            onClick={() => setDeleteConfirm(noticia.id)}
                                            aria-label={`Remover notícia ${noticia.titulo}`}
                                            className="shrink-0 rounded-2xl bg-red-100 p-3 text-red-600 hover:bg-red-200 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-red-300"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {deleteConfirm && (
                    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="rounded-2xl bg-red-100 p-3">
                                    <AlertCircle className="w-6 h-6 text-red-600" />
                                </div>
                                <h2 className="text-2xl font-semibold text-slate-900">Confirmar remoção</h2>
                            </div>
                            <p className="text-slate-600 mb-8">Tem certeza que deseja remover esta notícia? Esta ação não pode ser desfeita.</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    disabled={deleting}
                                    className="flex-1 rounded-xl bg-slate-200 px-4 py-3 font-medium text-slate-900 hover:bg-slate-300 transition disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    disabled={deleting}
                                    className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700 disabled:opacity-50 transition"
                                >
                                    {deleting ? 'Removendo...' : 'Remover'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <section className="mt-14 flex justify-center">
                    <BacktoHome />
                </section>
            </main>

            <Footer />
        </div>
    )
}

export default DeleteNews
