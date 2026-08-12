import Header from '../components/Header'
import BlueButton from '../components/buttons/BlueButton'
import GrayButton from '../components/buttons/GrayButton'
import Footer from '../components/Footer'
import { NavLink } from 'react-router-dom'

function Home() {
  const highlights = [
    {
      title: 'Projetos reais',
      description: 'Experiências práticas que conectam teoria e mercado em Engenharia da Computação.'
    },
    {
      title: 'Notícias atualizadas',
      description: 'Acompanhe eventos, editais e novidades do núcleo em tempo real.'
    },
    {
      title: 'Aprendizado colaborativo',
      description: 'Desenvolva competências em equipe com professores e alunos engajados.'
    }
  ]

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <section className="mx-auto max-w-6xl rounded-4xl bg-white border border-slate-200 p-10 shadow-[0_32px_80px_-40px_rgba(15,23,42,0.2)]">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
            <div className="space-y-6 text-center lg:text-left">
              <span className="inline-flex rounded-full bg-[#eff6ff] px-4 py-1 text-sm font-semibold uppercase tracking-[0.24em] text-[#002057]">NPEC • Engenharia da Computação</span>
              <div>
                <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Inovação aplicada para quem transforma tecnologia em impacto real.</h1>
                <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">Aqui, teoria e prática caminham juntas em projetos, pesquisas e publicações que preparam estudantes para desafios profissionais e soluções concretas.</p>
              </div>
              <div className="flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:justify-start">
                <NavLink to="/page_noticias" className="w-full sm:w-auto">
                  <BlueButton label="Ver Notícias" className="w-full sm:w-auto" />
                </NavLink>
                <NavLink to="/page_sobre" className="w-full sm:w-auto">
                  <GrayButton label="Sobre o NPEC" className="w-full sm:w-auto" />
                </NavLink>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Por que escolher o NPEC?</h2>
              <p className="text-slate-600 leading-7">O núcleo oferece ambiente colaborativo, projetos reais com impacto social e suporte para o crescimento técnico e profissional da comunidade acadêmica.</p>
            </div>
          </div>
        </section>

        <section className="mt-14 grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.title} className="rounded-[28px] bg-white border border-slate-200 p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-600 leading-7">{item.description}</p>
            </div>
          ))}
        </section>

        <section className="mt-14 mx-auto max-w-6xl rounded-[28px] bg-white border border-slate-200 p-10 shadow-[0_32px_80px_-40px_rgba(15,23,42,0.2)]">
          <h2 className="text-3xl font-semibold text-slate-900 mb-4">Nossa missão</h2>
          <p className="text-slate-600 leading-8">Promover a formação de profissionais de Engenharia da Computação por meio de projetos reais, desenvolvimento técnico e colaboração acadêmica.</p>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Home
