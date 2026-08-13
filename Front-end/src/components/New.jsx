import { useEffect, useState } from "react"
import axios from "axios"
import { Inbox } from "lucide-react"
import "./New.css"

const api_url = import.meta.env.VITE_API_URL

function Noticias({ onNoticiaClick }) {
    const [noticias, setNoticias] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function fetchNoticias() {
            try {
                const response = await axios.get(`${api_url}/noticias/`)
                setNoticias(response.data)
            } catch (error) {
                console.error("Erro ao buscar notícias:", error)
                setError('Erro ao carregar notícias')
            } finally {
                setLoading(false)
            }
        }

        fetchNoticias()
    }, [])

    const handleNoticiaClick = (noticiaId) => {
        if (onNoticiaClick) {
            onNoticiaClick(noticiaId)
        }
    }

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-[#002057] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-600">Carregando notícias...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
            </div>
        )
    }

    if (noticias.length === 0) {
        return (
            <div className="text-center py-16">
                <Inbox className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-600 font-medium">Nenhuma notícia encontrada.</p>
                <p className="text-sm text-slate-400 mt-1">Novas notícias aparecerão aqui assim que forem publicadas.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-wrap gap-10 md:gap-16 lg:gap-20 justify-center">
            {noticias.map((noticia) => (
                <button
                    key={noticia.id}
                    type="button"
                    onClick={() => handleNoticiaClick(noticia.id)}
                    className="flex flex-col flex-wrap gap-6 rounded-xl shadow-new w-90 h-100 md:w-80 md:h-90 lg:w-90 lg:h-100 p-6 cursor-pointer transform duration-300 hover:scale-95 text-left bg-white border-0"
                >
                    <div className="bg-news w-full h-30"></div>

                    <div className="flex flex-1 flex-col gap-2">
                        <h2 className="font-bold text-[#002057] text-2xl">{noticia.titulo}</h2>
                        <p>{noticia.descricao}</p>
                        {/* Antes: {noticia.criado_em} exibia a string ISO crua
                            (ex: "2026-08-12T14:30:00.000Z"). Formatado para
                            pt-BR, igual ao padrão já usado em NewContent.jsx. */}
                        <small className="mt-auto text-slate-500">
                            {new Date(noticia.criado_em).toLocaleDateString('pt-BR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </small>
                    </div>
                </button>
            ))}
        </div>
    )
}

export default Noticias
