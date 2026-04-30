import Header from '../components/Header'
import Footer from '../components/Footer'
import Edital from '../components/Edital'
import BacktoHome from '../components/buttons/BacktoHome'
import './editais.css'
import { useEffect, useRef, useState } from 'react'
import axios from 'axios'

const api_url = import.meta.env.VITE_API_URL

function Editais() {
    const setRef = (index) => (elem) => {
        refs.current[index] = elem
    }

    const animClass = (index) => `transition-all duration-700 ${
        visibleItems.includes(index) ? 'opacity-100  translate-y-0' : 'opactiy-0 translate-y-8'
    }`

    const [visibleItems, setVisibleItems] = useState([])
    const [editais, setEditais] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const refs = useRef([])

    useEffect(() => {
        const fetchEditais = async () => {
            try {
                const response = await axios.get(`${api_url}/documentos/`)
                setEditais(response.data)
            } catch (error) {
                console.error('Erro ao buscar editais:', error)
                setError('Erro ao carregar editais')
            } finally {
                setLoading(false)
            }
        }

        fetchEditais()
    }, [])

    useEffect(() => {
        const observers = refs.current.map((ref, index) => {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setVisibleItems(prev => [...prev, index])
                        observer.disconnect()
                    }
                },
                { threshold: 0.2 }
            )
            if (ref) observer.observe(ref)
            return observer
        })
        return () => observers.forEach(observer => observer?.disconnect())
    }, [])

    return (
        <div>
            <Header />

            <section ref={setRef(0)} className={`${animClass(0)} flex flex-col items-center gap-10 pt-20`}>
                <h1 className='text-3xl text-[#002057] font-bold'>Editais e Documentos</h1>
                <p className='text-center'>Encontre aqui os editais, documentos e informações importantes para participar dos programas do NPEC</p>
            </section>

            <section ref={setRef(1)} className={`${animClass(1)} flex flex-wrap justify-center gap-10 p-20`}>
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-gray-600">Carregando editais...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-red-600">{error}</p>
                    </div>
                ) : editais.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">Nenhum edital encontrado.</p>
                    </div>
                ) : (
                    editais.map((edital) => {
                        // Remove "Back_End/" do caminho se existir, deixando apenas "/uploads/..."
                        let fileUrl = edital.arquivo_url.replace('Back_End/', '')
                        // Garante que a URL comece com /
                        if (!fileUrl.startsWith('/')) {
                            fileUrl = '/' + fileUrl
                        }
                        // Monta a URL completa com a URL da API
                        fileUrl = `${api_url}${fileUrl}`
                        
                        console.log('URL construída:', fileUrl)
                        
                        return (
                            <Edital
                                key={edital.id}
                                title={edital.titulo}
                                description={edital.descricao || 'Sem descrição'}
                                archive_name={edital.nome_original}
                                href={fileUrl}
                            />
                        )
                    })
                )}
            </section>

            <section ref={setRef(2)} className={`${animClass(2)} flex justify-center mt-10`}>
                <BacktoHome />
            </section>

            <Footer />
        </div>
    )
}

export default Editais