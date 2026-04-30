import Header from "../components/Header"
import Footer from "../components/Footer"
import MainLogo from '../components/MainLogo'
import BacktoHome from "../components/buttons/BacktoHome"
import { Eye, Zap, BadgeCheck } from "lucide-react"

function Sobre() {
    const divs = [
        { title: "Missão", content: "Promover a formação de profissionais de Engenharia da Computação através de práticas inovadoras, pesquisa aplicada e projetos que agreguem valor técnico e social", icon: <Zap /> },
        { title: "Visão", content: "Ser referência em excelência acadêmica e tecnológica, contribuindo para o desenvolvimento de soluções inovadoras que transformem positivamente a sociedade.", icon: <Eye /> },
        { title: "Valores", content: ["✓ Inovação e criatividade", "✓ Excelência técnica", "✓ Colaboração e trabalho em equipe", "✓ Responsabilidade social"], icon: <BadgeCheck /> }
    ]

    return (
        <div className="bg-slate-50 min-h-screen text-slate-900">
            <Header />

            <main className="container mx-auto px-4 py-16">
                <section className="mx-auto max-w-5xl rounded-[28px] bg-white border border-slate-200 p-10 shadow-sm">
                    <div className="space-y-6">
                        <h1 className="text-3xl font-semibold text-[#002057]">Sobre o NPEC</h1>
                        <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center">
                            <div className="shrink-0 lg:max-w-60">
                                <MainLogo />
                            </div>
                            <div>
                                <h3 className="text-2xl font-semibold text-slate-900">O que é o NPEC?</h3>
                                <p className="mt-4 text-slate-600 leading-7">O NPEC (Núcleo de Práticas em Engenharia da Computação) é um espaço acadêmico dedicado à integração entre teoria e prática, proporcionando aos estudantes a oportunidade de desenvolver habilidades técnicas, trabalhar em projetos reais e contribuir para soluções inovadoras que impactam a sociedade.</p>
                                <p className="mt-4 text-slate-600 leading-7">Somos um ambiente colaborativo que promove a excelência em pesquisa, inovação tecnológica e extensão universitária.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-14 grid gap-6 md:grid-cols-3">
                    {divs.map((div) => (
                        <div key={div.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#002057] text-white">{div.icon}</div>
                            <h4 className="mt-5 text-xl font-semibold text-slate-900">{div.title}</h4>
                            {Array.isArray(div.content) ? (
                                <ul className="mt-4 space-y-2 text-slate-600 leading-7">
                                    {div.content.map((phrase) => (
                                        <li key={phrase}>{phrase}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="mt-4 text-slate-600 leading-7">{div.content}</p>
                            )}
                        </div>
                    ))}
                </section>

                <section className="mt-14">
                    <div className="mx-auto max-w-4xl rounded-[28px] bg-[#f8fafc] border border-slate-200 p-10 shadow-sm">
                        <h3 className="text-2xl font-semibold text-slate-900">Vínculo com o Curso de Engenharia da Computação</h3>
                        <p className="mt-5 text-slate-600 leading-8">O NPEC é uma extensão natural do currículo de Engenharia da Computação, oferecendo aos alunos oportunidades de aprendizado prático complementar aos conteúdos teóricos das disciplinas. Através de projetos reais, pesquisa e colaborações com a indústria, os estudantes desenvolvem as competências necessárias para enfrentar os desafios do mercado de trabalho moderno.</p>
                    </div>
                </section>

                <section className="mt-14 flex justify-center">
                    <BacktoHome />
                </section>
            </main>

            <Footer />
        </div>
    )
}

export default Sobre