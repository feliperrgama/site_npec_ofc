import './App.css'
import 'react-toastify/dist/ReactToastify.css'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import GhostPage from './pages/GhostPage'
import LoginADM from './pages/LoginADM'
import AdminDashboard from './pages/AdminDashboard'
import Sobre from './pages/Sobre'
import Equipe from './pages/Equipe'
import Projetos from './pages/Projetos'
import Editais from './pages/Editais'
import PostEdital from './pages/PostEdital'
import PostProjeto from './pages/PostProjeto'
import DeleteNews from './pages/DeleteNews'
import DeleteEditais from './pages/DeleteEditais'
import News from './pages/News'
import NewContent from './components/NewContent'
import { ToastContainer } from 'react-toastify'

const ghost_page_route = import.meta.env.VITE_GHOST_PAGE_ROUTE || "/ghostpage"
const loginadm_route = import.meta.env.VITE_LOGIN_PAGE_ROUTE || "/loginadm"
const admin_dashboard_route = import.meta.env.VITE_ADMIN_DASHBOARD || "/admin/dashboard"

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path={loginadm_route} element={<LoginADM />}/>
        <Route path={admin_dashboard_route} element={<AdminDashboard />} />
        <Route path={ghost_page_route} element={<GhostPage />} />
        <Route path='/page_sobre' element={<Sobre />} />
        <Route path='/page_projetos' element={<Projetos />} />
        <Route path='/page_equipe' element={<Equipe />} />
        <Route path='/page_editais' element={<Editais />} />
        <Route path='/post_edital' element={<PostEdital />} />
        <Route path='/post_projeto' element={<PostProjeto />} />
        <Route path='/delete_news' element={<DeleteNews />} />
        <Route path='/delete_editais' element={<DeleteEditais />} />
        <Route path='/page_noticias' element={<News />} />
        <Route path='/noticias/:id' element={<NewContent />} />
      </Routes>
      <ToastContainer position='top-right'/>
    </>
  )
}

export default App
