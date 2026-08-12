import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Header from '../components/Header'
import Footer from '../components/Footer'
import BacktoHome from '../components/buttons/BacktoHome'
import { FilePlus, CheckCircle2 } from 'lucide-react'
import { authHeader } from '../utils/auth'

const api_url = import.meta.env.VITE_API_URL

function PostProjeto() {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('Em desenvolvimento')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  // Antes: o projeto era salvo só em localStorage, então ele nunca aparecia
  // para outros visitantes nem sobrevivia à troca de navegador/dispositivo.
  // Agora publica no backend, no mesmo padrão usado por notícias e editais.
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim() || !category.trim() || !description.trim()) {
      setError('Título, categoria e descrição são obrigatórios')
      setSuccess('')
      return
    }

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await axios.post(
        `${api_url}/projetos/`,
        {
          title: title.trim(),
          category: category.trim(),
          description: description.trim(),
          status,
        },
        { headers: authHeader() }
      )

      setSuccess('Projeto salvo com sucesso!')
      toast.success('Projeto cadastrado com sucesso.')

      setTitle('')
      setCategory('')
      setDescription('')
      setStatus('Em desenvolvimento')

      setTimeout(() => {
        navigate('/page_projetos')
      }, 1200)
    } catch (err) {
      console.error('Erro ao salvar projeto:', err)
      if (err.response?.status === 401) {
        setError('Sessão expirada. Faça login novamente.')
      } else if (err.response?.status === 422) {
        setError('Dados inválidos. Verifique os campos e tente novamente.')
      } else {
        setError('Erro ao salvar projeto. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="bg-white rounded-[28px] border border-slate-200 p-10 shadow-[0_32px_80px_-40px_rgba(15,23,42,0.2)]">
          <div className="flex flex-col items-center text-center gap-4 mb-10">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#002057]/10 text-[#002057]">
              <FilePlus className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Postar Projetos</h1>
              <p className="mt-3 text-slate-600">Cadastre projetos do núcleo para divulgação na página de Projetos.</p>
            </div>
          </div>

          {error && (
            <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div role="status" className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>{success}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-800 mb-2">Título do projeto *</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Plataforma de Gestão Acadêmica"
                disabled={loading}
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#002057] focus:outline-none focus:ring-2 focus:ring-[#002057]/10 disabled:opacity-60"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-800 mb-2">Categoria *</label>
              <input
                id="category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: IA e P&D"
                disabled={loading}
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#002057] focus:outline-none focus:ring-2 focus:ring-[#002057]/10 disabled:opacity-60"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-800 mb-2">Descrição *</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Descreva brevemente o objetivo e o impacto do projeto"
                disabled={loading}
                className="w-full resize-none rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#002057] focus:outline-none focus:ring-2 focus:ring-[#002057]/10 disabled:opacity-60"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-800 mb-2">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading}
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#002057] focus:outline-none focus:ring-2 focus:ring-[#002057]/10 disabled:opacity-60"
              >
                <option>Em desenvolvimento</option>
                <option>Fase de testes</option>
                <option>Publicação aberta</option>
                <option>Lançado</option>
                <option>Planejamento</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#002057] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#001934] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar projeto'
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <BacktoHome />
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default PostProjeto
