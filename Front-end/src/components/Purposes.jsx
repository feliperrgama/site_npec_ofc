import { Lightbulb, BookOpenText, Users } from "lucide-react"
import "./Purposes.css"
import { useEffect, useRef, useState } from "react"

function Purposes() {
    const purposes = [
        {icon: <Lightbulb size={32}/>, title: "Inovação", description: "Desenvolvimento de soluções tecnológicas criativas para problemas reais da sociedade."},

        {icon: <BookOpenText size={32} />, title: "Pesquisa", description: "Investigação científica aplicada em áreas como IA, IoT, sistemas embarcados e mais."},

        {icon: <Users size={32}/>, title: "Extensão", description: "Conexão entre universidade e comunidade através de projetos de impacto social."}
    ]

    const [visibleItems, setVisibleItems] = useState([])
    const refs = useRef([])

    useEffect(() => {
        const observers = refs.current.map((ref, index) => {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setVisibleItems(prev => [...prev, index])
                        observer.disconnect() // para de observar após aparecer
                    }
                },
                { threshold: 0.2 } // aparece quando 20% do elemento estiver visível
            )
            if (ref) observer.observe(ref)
            return observer
        })

        return () => observers.forEach(obs => obs.disconnect())
    }, [])

    return (
        <section className="mt-30 flex flex-wrap justify-around lg:gap-0 gap-8 mb-25">
            {purposes.map((purpose, index) => (
            <div className={`w-120 h-80 div rounded-2xl p-6 flex flex-col gap-4 text-white card-animate card border-2 border-cyan-300 hover:border-4 ${visibleItems.includes(index) ? "visible" : ""}`} key={purpose.title} ref={el => refs.current[index] = el}>
                
                <div className="p-3.5 bg-[#315180] rounded-2xl w-max">
                    {purpose.icon}
                </div>

                <h5 className="font-bold text-white">{purpose.title}</h5>

                <p>{purpose.description}</p>
            </div>
        ))}
        </section>
    )
}

export default Purposes