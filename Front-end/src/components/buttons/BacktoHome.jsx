import { ChevronRight } from "lucide-react"
import { NavLink } from "react-router-dom"

function BacktoHome() {
    return (
        <NavLink to="/">
                    <button className="rounded-2xl flex items-center cursor-pointer w-50 h-13 self-center text-center transition-all indent-8 duration-300 hover:scale-105 bg-slate-300 mt-10 md:mt-10 mb-20 font-bold" style={{color: "#002057"}}>
                        Voltar à Home
                        <ChevronRight className="ml-2 text-2xl" />
                    </button>
        </NavLink>
    )
}

export default BacktoHome