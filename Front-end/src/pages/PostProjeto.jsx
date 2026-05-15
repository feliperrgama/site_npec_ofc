import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Header from '../components/Header'
import Footer from '../components/Footer'
import BacktoHome from '../components/buttons/BacktoHome'
import { FilePlus, CheckCircle2 } from 'lucide-react'

function PostProjeto() {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('Em desenvolvimento')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !category.trim() || !description.trim()) {
      setError('Título, categoria e descrição são obrigatórios')
      setSuccess('')
      return
    }

    const existing = JSON.parse(localStorage.getItem('npec_projects') || '[]')
    const newProject = {
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      status,
      postedAt: new Date().toLocaleDateString('pt-BR')
    }

    localStorage.setItem('npec_projects', JSON.stringify([newProject, ...existing]))
    setError('')
    setSuccess('Projeto salvo com sucesso!')
    toast.success('Projeto cadastrado com sucesso.')

    setTitle('')
    setCategory('')
    setDescription('')
    setStatus('Em desenvolvimento')

    setTimeout(() => {
      navigate('/page_projetos')
    }, 1200)
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
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
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
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#002057] focus:outline-none focus:ring-2 focus:ring-[#002057]/10"
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
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#002057] focus:outline-none focus:ring-2 focus:ring-[#002057]/10"
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
                className="w-full resize-none rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#002057] focus:outline-none focus:ring-2 focus:ring-[#002057]/10"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-800 mb-2">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#002057] focus:outline-none focus:ring-2 focus:ring-[#002057]/10"
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#002057] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#001934]"
            >
              Salvar projeto
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
