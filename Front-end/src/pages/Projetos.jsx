import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { ArrowRight } from 'lucide-react'
import { NavLink } from 'react-router-dom'

function Projetos() {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    const stored = localStorage.getItem('npec_projects')
    if (stored) {
      try {
        const custom = JSON.parse(stored)
        if (Array.isArray(custom)) {
          setProjects(custom)
        }
      } catch (error) {
        console.warn('Não foi possível carregar projetos personalizados:', error)
      }
    }
  }, [])

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <section className="mx-auto max-w-6xl rounded-[28px] bg-white border border-slate-200 p-10 shadow-[0_32px_80px_-40px_rgba(15,23,42,0.2)]">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-6">
              <span className="inline-flex rounded-full bg-[#eff6ff] px-4 py-1 text-sm font-semibold uppercase tracking-[0.26em] text-[#002057]">Projetos do núcleo</span>
              <div>
                <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Inovação, impacto e experiências práticas em engenharia.</h1>
                <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">Conheça os projetos que representam nossas áreas de atuação: tecnologia, pesquisa, educação e desenvolvimento profissional.</p>
              </div>
              <NavLink to="/page_equipe" className="inline-flex items-center gap-2 rounded-full bg-[#002057] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#001934]">
                Ver equipe responsável <ArrowRight size={18} />
              </NavLink>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Por que divulgar nossos projetos?</h2>
              <p className="text-slate-600 leading-7">A divulgação fortalece o reconhecimento do núcleo, aproxima estudantes de oportunidades reais e compartilha resultados relevantes com a comunidade acadêmica.</p>
              <ul className="mt-6 space-y-4 text-slate-600 leading-7">
                <li>• Transparência e alcance para iniciativas técnicas.</li>
                <li>• Estímulo à colaboração entre alunos e professores.</li>
                <li>• Valorização de soluções com impacto social e tecnológico.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-14">
          {projects.length === 0 ? (
            <div className="rounded-[28px] border border-slate-200 bg-white p-12 text-center shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Nenhum projeto publicado ainda</h2>
              <p className="mt-4 text-slate-600 leading-7">Os projetos são adicionados pelo admin no dashboard. Após a primeira publicação, eles aparecerão aqui automaticamente.</p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <article key={project.title} className="group rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#002057]">{project.category}</p>
                      <h3 className="mt-4 text-2xl font-semibold text-slate-900">{project.title}</h3>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">{project.status}</span>
                  </div>
                  <p className="mt-5 text-slate-600 leading-7">{project.description}</p>
                  <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#002057]">
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#002057]" />
                    Projeto em destaque
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-3">
          <div className="rounded-[28px] bg-[#002057] p-8 text-white shadow-sm">
            <h3 className="text-xl font-semibold">Foco técnico</h3>
            <p className="mt-4 text-slate-200 leading-7">Desenvolvemos soluções com foco em software, IA, infraestrutura e produtos digitais que ampliam conhecimento e aplicabilidade.</p>
          </div>
          <div className="rounded-[28px] bg-[#002057] p-8 text-white shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">Metodologia</h3>
            <p className="mt-4 text-slate-600 leading-7">Trabalhamos com ciclos iterativos, prototipagem rápida e parceria entre alunos, professores e empresas para entregar resultados consistentes.</p>
          </div>
          <div className="rounded-[28px] bg-[#002057] p-8 text-white shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">Impacto</h3>
            <p className="mt-4 text-slate-600 leading-7">Os projetos visam gerar valor acadêmico e social, ampliando a visibilidade do núcleo e fortalecendo a cultura de inovação na instituição.</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Projetos
