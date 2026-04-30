import Header from "../components/Header"
import Footer from "../components/Footer"
import Monitor from "../components/Monitor"
import MonitorPhoto from "../components/MonitorPhoto"
import { ChevronRight } from "lucide-react"
import { NavLink } from "react-router-dom"
import { useState } from "react"
import { X } from "lucide-react"
import BacktoHome from "../components/buttons/BacktoHome"

/*
    1. Criar um estado de nulo e não nulo para verificar qual monitor foi clicado
    2. Colocar uma descrição para cada monitor na lista de objetos "monitores"
    3. Passar o onClick para cada monitor e criar uma propos de OnClick
    4. criar o modal
*/

function Equipe() {
    const [selectedMonitor, setSelectedMonitor] = useState(null)

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

            <main className="container mx-auto px-4 py-16">
                <section className="mx-auto max-w-3xl text-center space-y-6 mb-16">
                    <h1 className="text-4xl font-semibold text-[#002057]">Nossa Equipe</h1>
                    <p className="text-base text-slate-600 leading-8">Conheça os talentos e dedicados profissionais que fazem o NPEC funcionar com excelência.</p>
                </section>

                <section className="flex flex-wrap justify-center gap-8 mb-16">
                    {monitores.map((monitor) => (
                        <div key={monitor.name} onClick={() => setSelectedMonitor(monitor)} className="cursor-pointer w-full sm:w-96">
                            <Monitor name={monitor.name} job={monitor.job} photo={<MonitorPhoto />} OnClick={() => setSelectedMonitor(monitor)}/>
                        </div>
                    ))}
                </section>

                <section className="flex justify-center mb-16">
                    <BacktoHome />
                </section>
            </main>

            <Footer />

            {selectedMonitor && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedMonitor(null)}>
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full flex flex-col items-center gap-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setSelectedMonitor(null)} className="ml-auto text-slate-400 hover:text-slate-900 transition">
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex flex-col items-center gap-6 text-center">
                            <MonitorPhoto />
                            <div className="space-y-2">
                                <h2 className="font-semibold text-[#002057] text-2xl">{selectedMonitor.name}</h2>
                                <p className="text-sm font-medium text-slate-500">{selectedMonitor.job}</p>
                            </div>
                            <p className="text-slate-600 leading-7 text-sm">{selectedMonitor.description}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Equipe