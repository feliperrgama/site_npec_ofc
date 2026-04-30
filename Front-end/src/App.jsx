import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import GhostPage from './pages/GhostPage'
import LoginADM from './pages/LoginADM'
import AdminDashboard from './pages/AdminDashboard'
import Sobre from './pages/Sobre'
import Equipe from './pages/Equipe'
import Editais from './pages/Editais'
import PostEdital from './pages/PostEdital'
import DeleteNews from './pages/DeleteNews'
import DeleteEditais from './pages/DeleteEditais'
import News from './pages/News'
import NewContent from './components/NewContent'
import { ToastContainer } from 'react-toastify'

const ghost_page_route = import.meta.env.VITE_GHOST_PAGE_ROUTE
const loginadm_route = import.meta.env.VITE_LOGIN_PAGE_ROUTE

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path={loginadm_route} element={<LoginADM />}/>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path={ghost_page_route} element={<GhostPage />} />
        <Route path='/page_sobre' element={<Sobre />} />
        <Route path='/page_equipe' element={<Equipe />} />
        <Route path='/page_editais' element={<Editais />} />
        <Route path='/post_edital' element={<PostEdital />} />
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
