import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { FileText, Newspaper, LogOut, Trash2, Layers, ShieldCheck } from 'lucide-react'
import { clearSession, getUser } from '../utils/auth'
import './AdminDashboard.css'

function AdminDashboard() {
    const navigate = useNavigate()
    const user = getUser()

    const handleLogout = () => {
        // Antes: localStorage.removeItem('token') — chave errada.
        // O login salva em 'access_token' (localStorage OU sessionStorage,
        // dependendo de "manter conectado"), então o logout nunca limpava
        // a sessão de fato. clearSession() cobre os dois storages e as duas chaves.
        clearSession()
        navigate('/login_adm')
    }

    const publishItems = [
        {
            title: 'Publicar Notícias',
            description: 'Criar e publicar novas notícias no portal',
            icon: Newspaper,
            path: '/ghost_page',
        },
        {
            title: 'Postar Editais',
            description: 'Fazer upload de editais e documentos em PDF',
            icon: FileText,
            path: '/post_edital',
        },
        {
            title: 'Postar Projetos',
            description: 'Cadastrar novos projetos do núcleo para divulgação',
            icon: Layers,
            path: '/post_projeto',
        },
    ]

    const removeItems = [
        {
            title: 'Remover Projetos',
            description: 'Deletar projetos publicados na página de projetos',
            icon: Trash2,
            path: '/delete_projetos',
        },
        {
            title: 'Remover Notícias',
            description: 'Deletar notícias do portal',
            icon: Trash2,
            path: '/delete_news',
        },
        {
            title: 'Remover Editais',
            description: 'Deletar editais e documentos do portal',
            icon: Trash2,
            path: '/delete_editais',
        },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="container mx-auto px-4 py-12">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col items-center text-center gap-3 mb-12">
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#eff6ff] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#002057]">
                            <ShieldCheck className="w-4 h-4" />
                            Área Administrativa
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900">Painel Administrativo</h1>
                        <p className="text-lg text-gray-600 max-w-2xl">
                            {user?.nome
                                ? `Olá, ${user.nome}. Escolha uma opção para gerenciar o conteúdo do portal.`
                                : 'Escolha uma opção para gerenciar o conteúdo do portal.'}
                        </p>
                    </div>

                    <section className="mb-10">
                        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 mb-4">Publicar conteúdo</h2>
                        <div className="grid gap-6 md:grid-cols-3">
                            {publishItems.map((item) => (
                                <button
                                    key={item.path}
                                    type="button"
                                    onClick={() => navigate(item.path)}
                                    className="group text-left bg-[#002057] hover:bg-[#0064c8] rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0064c8]/30"
                                >
                                    <item.icon className="w-9 h-9 mb-4 opacity-90" />
                                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                    <p className="text-sm text-white/80 leading-relaxed">{item.description}</p>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 mb-4">Remover conteúdo</h2>
                        <div className="grid gap-6 md:grid-cols-3">
                            {removeItems.map((item) => (
                                <button
                                    key={item.path}
                                    type="button"
                                    onClick={() => navigate(item.path)}
                                    className="group text-left bg-white border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300/40"
                                >
                                    <item.icon className="w-9 h-9 mb-4 text-orange-600" />
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                                </button>
                            ))}
                        </div>
                    </section>

                    <div className="text-center">
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-red-300"
                        >
                            <LogOut className="w-5 h-5" />
                            Sair
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default AdminDashboard
