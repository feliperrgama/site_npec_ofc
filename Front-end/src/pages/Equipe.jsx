import Header from "../components/Header"
import Footer from "../components/Footer"
import BacktoHome from "../components/buttons/BacktoHome"

function Equipe() {
    const monitores = [
        { name: "Camila Ramos", job: "Coordenadora Administrativa", description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid, perspiciatis! Natus fugiat nesciunt iure voluptas aperiam culpa magnam sint itaque assumenda, suscipit sequi in. Saepe voluptatem labore temporibus sunt maxime?" },
        { name: "Esdrás Santos", job: "Vice-Coordenador do NPEC", description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid, perspiciatis! Natus fugiat nesciunt iure voluptas aperiam culpa magnam sint itaque assumenda, suscipit sequi in. Saepe voluptatem labore temporibus sunt maxime?" },
        { name: "Felipe Gama", job: "Coordenador de Projetos & Coordenador de Relações Externas", description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid, perspiciatis! Natus fugiat nesciunt iure voluptas aperiam culpa magnam sint itaque assumenda, suscipit sequi in. Saepe voluptatem labore temporibus sunt maxime?" },
        { name: "Guilheme Pereira", job: "Coordenador de Comunicação e Marketing", description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid, perspiciatis! Natus fugiat nesciunt iure voluptas aperiam culpa magnam sint itaque assumenda, suscipit sequi in. Saepe voluptatem labore temporibus sunt maxime?" },
        { name: "Lana Ramos", job: "Coordenadora de Projetos", description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid, perspiciatis! Natus fugiat nesciunt iure voluptas aperiam culpa magnam sint itaque assumenda, suscipit sequi in. Saepe voluptatem labore temporibus sunt maxime?" },
        { name: "Maria Letícia", job: "Coordenadora de Projetos", description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid, perspiciatis! Natus fugiat nesciunt iure voluptas aperiam culpa magnam sint itaque assumenda, suscipit sequi in. Saepe voluptatem labore temporibus sunt maxime?" },
        { name: "Matheus Botelho", job: "Coordenador do NPEC", description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid, perspiciatis! Natus fugiat nesciunt iure voluptas aperiam culpa magnam sint itaque assumenda, suscipit sequi in. Saepe voluptatem labore temporibus sunt maxime?" }
    ]

    return (
        <div className="bg-slate-50 min-h-screen text-slate-900">
            <Header />

            <main className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <section className="mx-auto max-w-4xl text-center mb-16">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Equipe NPEC</p>
                    <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#002057] sm:text-5xl">Profissionais que conduzem nosso núcleo</h1>
                    <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">Conheça os integrantes do NPEC e o papel de cada um no desenvolvimento de projetos, gestão e comunicação.</p>
                </section>

                <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {monitores.map((monitor) => (
                        <article key={monitor.name} className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#002057] text-white text-lg font-semibold">{monitor.name.split(" ").map((n) => n[0]).join("")}</div>
                            <h2 className="text-xl font-semibold text-slate-900">{monitor.name}</h2>
                            <p className="mt-2 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">{monitor.job}</p>
                            <p className="mt-5 text-slate-600 leading-7">{monitor.description}</p>
                        </article>
                    ))}
                </section>

                <section className="mt-16 flex justify-center">
                    <BacktoHome />
                </section>
            </main>

            <Footer />
        </div>
    )
}

export default Equipe