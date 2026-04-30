import { NavLink } from "react-router-dom"
import "./Monitor.css"

function Monitor({ name, job, photo, OnClick }) {
    // if (!photo) {
    //     photo = "Imagem de usuário vazio"
    // }

    return (        
            <div onClick={OnClick} className="flex flex-col gap-5 items-center pt-8 pl-10 pr-10 cursor-pointer div-monitor transition-all duration-300 bg-slate-300 mt-10 w-100 h-80 rounded-2xl group group-hover:visible">
                {photo}

                <h3 className="text-xl font-bold text-[#002057]">{name}</h3>

                <p>{job}</p>

                <a className="invisible group-hover:visible text-[#002057] group-hover:border-b-2 group-hover:border-b-[#002057]">Saiba mais</a>
            </div>
    )
}

export default Monitor