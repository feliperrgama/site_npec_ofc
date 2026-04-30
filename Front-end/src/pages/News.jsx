import Header from "../components/Header"
import Footer from "../components/Footer"
import BacktoHome from "../components/buttons/BacktoHome"
import New from "../components/New"
import NewContent from "../components/NewContent"
import './News.css'
import { useEffect, useRef, useState } from "react"

function News() {
    const [visibleItems, setVisibleItems] = useState([])
    const [selectedNoticiaId, setSelectedNoticiaId] = useState(null)
    const refs = useRef([])

    useEffect(() => {
        const observers = refs.current.map((ref, index) => {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setVisibleItems(prev => [...prev, index])
                        observer.disconnect()
                    }
                },
                { threshold: 0.2 }
            )
            if (ref) observer.observe(ref)
            return observer
        })

        return () => observers.forEach(obs => obs.disconnect())
    }, [])

    const isVisible = (index) => visibleItems.includes(index)

    return (
        <div>
            <Header />

            <main>
                <section
                    ref={el => refs.current[0] = el}
                    className={`flex justify-center mt-10 card-anim ${isVisible(0) ? "visible" : ""}`}
                >
                    <h1 className="font-bold text-[#002057] text-3xl text-center">Todas as Notícias</h1>
                </section>

                <section
                    ref={el => refs.current[1] = el}
                    className={`flex justify-center mt-20 card-anim ${isVisible(1) ? "visible" : ""}`}
                >
                    <New onNoticiaClick={setSelectedNoticiaId} />
                </section>

                <section
                    ref={el => refs.current[2] = el}
                    className={`flex justify-center mt-20 card-anim ${isVisible(2) ? "visible" : ""}`}
                >
                    <BacktoHome />
                </section>
            </main>

            {selectedNoticiaId && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setSelectedNoticiaId(null)}
                >
                    <div
                        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="sticky top-0 right-0 float-right p-6 text-slate-400 hover:text-slate-900 transition z-10"
                            onClick={() => setSelectedNoticiaId(null)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <NewContent id={selectedNoticiaId} />
                    </div>
                </div>
            )}

            <Footer />
        </div>
    )
}

export default News