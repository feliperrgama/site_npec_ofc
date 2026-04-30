import axios from 'axios'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const api_url = import.meta.env.VITE_API_URL

function NewContent({ id }) {
    const { id: routeId } = useParams()
    const noticiaId = id ?? routeId
    const [noticia, setNoticia] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!noticiaId) return

        async function fetchNoticia() {
            try {
                const response = await axios.get(`${api_url}/noticias/${noticiaId}`)
                setNoticia(response.data)
            } catch (error) {
                console.error('Erro ao buscar notícia:', error)
                setError('Não foi possível carregar a notícia.')
            } finally {
                setLoading(false)
            }
        }

        fetchNoticia()
    }, [noticiaId])

    if (loading) {
        return <div className="p-6">Carregando notícia...</div>
    }

    if (error) {
        return <div className="p-6 text-red-600">{error}</div>
    }

    if (!noticia) {
        return <div className="p-6">Notícia não encontrada.</div>
    }

    return (
        <div className="p-8 md:p-12 space-y-8">
            <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">{noticia.titulo}</h1>
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <time className="text-sm font-medium text-slate-500">
                        {new Date(noticia.criado_em).toLocaleDateString('pt-BR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </time>
                </div>
            </div>

            <div className="prose prose-sm max-w-none">
                <p className="text-base leading-8 text-slate-600 whitespace-pre-wrap">{noticia.conteudo}</p>
            </div>
        </div>
    )
}

export default NewContent
