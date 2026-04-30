import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { FileText, Newspaper, LogOut, Trash2 } from 'lucide-react'
import './AdminDashboard.css'

function AdminDashboard() {
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/')
    }

    const menuItems = [
        {
            title: 'Publicar Notícias',
            description: 'Criar e publicar novas notícias no portal',
            icon: Newspaper,
            path: import.meta.env.VITE_GHOST_PAGE_ROUTE,
            color: 'bg-[#002057] hover:bg-[#0064c8]'
        },
        {
            title: 'Postar Editais',
            description: 'Fazer upload de editais e documentos em PDF',
            icon: FileText,
            path: '/post_edital',
            color: 'bg-[#002057] hover:bg-[#0064c8]'
        },
        {
            title: 'Remover Notícias',
            description: 'Deletar notícias do portal',
            icon: Trash2,
            path: '/delete_news',
            color: 'bg-orange-600 hover:bg-orange-700'
        },
        {
            title: 'Remover Editais',
            description: 'Deletar editais e documentos do portal',
            icon: Trash2,
            path: '/delete_editais',
            color: 'bg-orange-600 hover:bg-orange-700'
        }
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="container mx-auto px-4 py-12">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Painel Administrativo</h1>
                        <p className="text-xl text-gray-600">Escolha uma opção para gerenciar o conteúdo do portal</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        {menuItems.map((item) => (
                            <div
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`${item.color} rounded-2xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl text-white`}
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <item.icon className="w-12 h-12" />
                                    <h2 className="text-2xl font-bold">{item.title}</h2>
                                </div>
                                <p className="text-lg opacity-90">{item.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
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