import Header from "../components/Header"
import Footer from "../components/Footer"
import BacktoHome from "../components/buttons/BacktoHome"

function Equipe() {
    const monitores = [
        { name: "Camila Ramos", photo: "camila_gomes", job: "Coordenadora Administrativa", description: "Estudante de Engenharia da Computação com interesse em robótica, automação, sistemas embarcados e FPGA. Atualmente atua como residente na trilha de FPGA do programa Embarcatech do CEPEDI, aprofundando conhecimentos em lógica digital e desenvolvimento de soluções em hardware reconfigurável. Possui experiência com C, C++, VHDL, Verilog e SystemVerilog, atuando em projetos de arquiteturas digitais, simulação e implementação em hardware. Também possui conhecimentos em MySQL e MongoDB, buscando integrar software, hardware e gerenciamento de dados em soluções computacionais. É membro do GEAR – Grupo de Estudos de Automação e Robótica da FAINOR, participando de iniciativas voltadas a tecnologias embarcadas e sistemas inteligentes." },
        { name: "Esdrás Santos", photo: "esdras_alves", job: "Vice-Coordenador do NPEC", description: "Desenvolvedor Backend e graduando em Engenharia da Computação pela FAINOR, com foco na construção de APIs RESTful robustas e escaláveis utilizando Java (Spring Boot), .NET (C#), Node.js e Go. Possui experiência em arquiteturas SaaS Multi-tenant com isolamento de dados, além de domínio em TDD, SOLID e metodologias ágeis. Atua com HPC e IA, operando clusters com Slurm e GRES para treinamento de redes neurais aplicadas a Reconhecimento Facial e Edge AI. Também desenvolve pipelines RAG, aplicações de Visão Computacional com YOLOv8 e soluções em IA Generativa. Possui expertise em Docker, Coolify e administração avançada de servidores Linux (Ubuntu), com foco em Hardening e Proxy Reverso (Nginx). Inglês avançado para leitura, escrita e conversação, com interesse em desafios técnicos de alta complexidade e projetos globais." },
        { name: "Felipe Gama", photo: "felipe_gama", job: "Coordenador de Projetos & Coordenador de Relações Externas", description: "Graduando em Engenharia da Computação pela FAINOR, com experiência em C++, Python, JavaScript, Java e C, além de atuação em desenvolvimento front-end. Possui interesse em dados, inteligência artificial e pesquisa, com formação em Ciência de Dados pela Alura. Participou por 16 meses da residência RESTIC 36 do CEPEDI, atuando com testes automatizados utilizando Robot Framework e, posteriormente, em um ambiente profissional de desenvolvimento de software. Durante a residência, desempenhou os papéis de Scrum Master e líder de equipe, adquirindo experiência em gestão de equipes, comunicação com stakeholders, apresentações de produto e aplicação prática de metodologias ágeis como Scrum e Kanban." },
        { name: "Guilheme Pereira", photo: "guilherme_pereira", job: "Coordenador de Comunicação e Marketing", description: "Graduando em Engenharia da Computação pela FAINOR, com experiência em tecnologia, educação e desenvolvimento de projetos de pesquisa e inovação. Atua como Coordenador de P&D no NPEC, liderando iniciativas voltadas à Engenharia da Computação e desenvolvimento tecnológico. Possui experiência como Educador de Informática na Prepara Cursos e atuação no CREAJR nas áreas de Projetos e Comunicação, além de conhecimentos em C, C++, Python, Git/GitHub, IoT, Sistemas Embarcados, Lógica de Programação e Metodologias Ágeis. Busca oportunidades de estágio e desenvolvimento profissional com foco em inovação, aprendizado contínuo e aplicação prática da tecnologia." },
        { name: "Lana Ramos", photo: "lana_ramos", job: "Coordenadora de Projetos", description: "Estudante de Engenharia de Computação com experiência em desenvolvimento de projetos acadêmicos e web, utilizando Python, C/C++, CMake e GitHub. Possui bom raciocínio lógico, facilidade de aprendizado e foco na resolução de problemas, com interesse em desenvolvimento de software e sistemas embarcados." },
        { name: "Maria Letícia", photo: "maria_leticia", job: "Coordenadora de Projetos", description: "Engenheira de Computação em formação com foco em sistemas de alta performance, IA e desenvolvimento Back-end. Atua como estagiária Full-Stack em P&D na FAINOR, participando da implementação do sistema de gestão e controle de catracas da instituição. Possui experiência em infraestrutura Linux, Docker, soluções Cloud-Native e arquiteturas Multi-tenant, além do desenvolvimento de pipelines RAG, busca semântica com LLMs, HPC com Slurm e treinamento de modelos de Deep Learning. Tem sólida experiência em Java (Spring Boot/Security), Python e integrações de APIs como Salesforce, Google Maps e Gemini, além de conhecimentos em TensorFlow, YOLO, OpenCV, React, Node.js, Angular, Nginx e CI/CD." },
        { name: "Matheus Botelho", photo: "matheus_botelho", job: "Coordenador do NPEC", description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid, perspiciatis! Natus fugiat nesciunt iure voluptas aperiam culpa magnam sint itaque assumenda, suscipit sequi in. Saepe voluptatem labore temporibus sunt maxime?" }
    ]

    const imageModules = import.meta.glob('../assets/integrants/*.{png,jpg,jpeg,svg,webp}', { eager: true })
    const imageMap = Object.entries(imageModules).reduce((map, [path, module]) => {
        const fileName = path.split('/').pop().replace(/\.[^.]+$/, '')
        return { ...map, [fileName]: module.default }
    }, {})

    return (
        <div className="bg-slate-50 min-h-screen text-slate-900">
            <Header />

            <main className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <section className="mx-auto max-w-4xl text-center mb-16">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Equipe NPEC</p>
                    <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#002057] sm:text-5xl">Discentes que conduzem nosso núcleo</h1>
                    <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">Conheça os integrantes do NPEC e o papel de cada um no desenvolvimento de projetos, gestão e comunicação.</p>
                </section>

                <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {monitores.map((monitor) => {
                        const photoSrc = imageMap[monitor.photo]
                        return (
                            <article key={monitor.name} className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col items-center text-center">
                                {photoSrc ? (
                                    <img
                                        src={photoSrc}
                                        alt={`Foto de ${monitor.name}`}
                                        loading="lazy"
                                        className="mb-6 h-20 w-20 rounded-full object-cover ring-2 ring-[#002057]/15"
                                    />
                                ) : (
                                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#002057] text-white text-lg font-semibold">{monitor.name.split(" ").map((n) => n[0]).join("")}</div>
                                )}
                                <h2 className="text-xl font-semibold text-slate-900">{monitor.name}</h2>
                                <p className="mt-2 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">{monitor.job}</p>
                                <p className="mt-5 text-slate-600 leading-7">{monitor.description}</p>
                            </article>
                        )
                    })}
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