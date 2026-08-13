import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Header from '../components/Header'
import Footer from '../components/Footer'
import BacktoHome from '../components/buttons/BacktoHome'
import { FilePlus, CheckCircle2 } from 'lucide-react'
import { getToken } from '../utils/auth'

const api_url = import.meta.env.VITE_API_URL

// Lista de status igual à STATUS_PROJETOS do backend (main.py).
// Precisa bater exatamente com o texto aceito pela API.
const STATUS_OPTIONS = [
    'Em desenvolvimento',
    'Fase de testes',
    'Planejamento',
    'Lançado',
    'Publicação Aberta',
]

function PostProjeto() {
  const [titulo, setTitulo] = useState('')
  const [categoria, setCategoria] = useState('')
  const [descricao, setDescricao] = useState('')
  const [statusProjeto, setStatusProjeto] = useState(STATUS_OPTIONS[0])
  const [imagem, setImagem] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleImagemChange = (e) => {
    const selected = e.target.files?.[0]
    if (selected && !selected.type.startsWith('image/')) {
      setError('O arquivo selecionado precisa ser uma imagem.')
      setImagem(null)
      return
    }
    setImagem(selected || null)
    setError('')
  }

  // O backend recebe este endpoint como multipart/form-data (Form + File),
  // não como JSON — por isso usamos FormData aqui, no mesmo padrão de
  // PostEdital.jsx e do formulário de Notícia em GhostPage.jsx.
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!titulo.trim() || !categoria.trim() || !descricao.trim()) {
      setError('Título, categoria e descrição são obrigatórios')
      setSuccess('')
      return
    }

    const token = getToken()
    if (!token) {
      setError('Sessão expirada. Faça login novamente.')
      return
    }

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('titulo', titulo.trim())
      formData.append('categoria', categoria.trim())
      formData.append('descricao', descricao.trim())
      formData.append('status_projeto', statusProjeto)
      if (imagem) formData.append('imagem', imagem)

      await axios.post(`${api_url}/projetos/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Content-Type não é definido manualmente — o axios monta o
          // boundary correto de multipart automaticamente.
        },
      })

      setSuccess('Projeto salvo com sucesso!')
      toast.success('Projeto cadastrado com sucesso.')

      setTitulo('')
      setCategoria('')
      setDescricao('')
      setStatusProjeto(STATUS_OPTIONS[0])
      setImagem(null)
      const fileInput = document.getElementById('imagem-input')
      if (fileInput) fileInput.value = ''

      setTimeout(() => {
        navigate('/page_projetos')
      }, 1200)
    } catch (err) {
      console.error('Erro ao salvar projeto:', err.response?.data || err)
      if (err.response?.status === 401) {
        setError('Sessão expirada. Faça login novamente.')
      } else if (err.response?.status === 422 || err.response?.status === 400) {
        setError(err.response?.data?.detail || 'Dados inválidos. Verifique os campos e tente novamente.')
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
              <label htmlFor="titulo" className="block text-sm font-medium text-slate-800 mb-2">Título do projeto *</label>
              <input
                id="titulo"
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Plataforma de Gestão Acadêmica"
                disabled={loading}
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#002057] focus:outline-none focus:ring-2 focus:ring-[#002057]/10 disabled:opacity-60"
              />
            </div>

            <div>
              <label htmlFor="categoria" className="block text-sm font-medium text-slate-800 mb-2">Categoria *</label>
              <input
                id="categoria"
                type="text"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                placeholder="Ex: IA e P&D"
                disabled={loading}
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#002057] focus:outline-none focus:ring-2 focus:ring-[#002057]/10 disabled:opacity-60"
              />
            </div>

            <div>
              <label htmlFor="descricao" className="block text-sm font-medium text-slate-800 mb-2">Descrição *</label>
              <textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={6}
                placeholder="Descreva brevemente o objetivo e o impacto do projeto (mínimo 10 caracteres)"
                disabled={loading}
                className="w-full resize-none rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#002057] focus:outline-none focus:ring-2 focus:ring-[#002057]/10 disabled:opacity-60"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-800 mb-2">Status</label>
              <select
                id="status"
                value={statusProjeto}
                onChange={(e) => setStatusProjeto(e.target.value)}
                disabled={loading}
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#002057] focus:outline-none focus:ring-2 focus:ring-[#002057]/10 disabled:opacity-60"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="imagem-input" className="block text-sm font-medium text-slate-800 mb-2">
                Imagem <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <input
                type="file"
                id="imagem-input"
                accept="image/*"
                onChange={handleImagemChange}
                disabled={loading}
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-[#002057] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#001934] disabled:opacity-60"
              />
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
