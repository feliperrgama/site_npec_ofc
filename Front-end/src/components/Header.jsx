import "./Header.css"
import { useState } from "react"
import LogoSVG from "../assets/Logo_Header.svg?react"
import { NavLink, Route } from "react-router-dom"

function Header() {
    const [isMenuOpen, setMenuOpen] = useState(false)

    const logo_img_info = {
        alt: "Logo do NPEC",
        size: 170
    }

    // {label: "Projetos", route: "/projetos"},
    const nav_links = [
        // Nos atributos href dos objetos devem estar os endpoints dessas respectivas páginas
        {label: "Home", route: "/"},
        {label: "Sobre", route: "/page_sobre"},
        // {label: "Equipe", route: "/page_equipe"},
        {label: "Notícias", route: "/page_noticias"},
        {label: "Editais", route: "/page_editais"}
    ]

    return (
        <header className="flex w-full w-100% justify-between items-center h-20 text-white relative">
            <LogoSVG className="ml-6 md:ml-20" width={logo_img_info.size} height={logo_img_info.size} alt={logo_img_info.alt} />

            <nav className="hidden md:flex gap-8 mr-25 pb-6 pt-6">
                {nav_links.map((link) => (
                    <NavLink 
                    to={link.route}
                    key={link.route}
                    className={({ isActive }) => isActive ? "font-bold text-white border-b-2 border-b-amber-50" : "font-normal text-white hover:text-[#c6c6c6] transition-colors duration-300 hover:border-b-2 hover:border-b-black"}>
                        {link.label}
                    </NavLink>
                ))}
            </nav>

            {/* Botão hamburguer: */}
            <button className="md:hidden md:mr-20 mr-6 flex flex-col gap-1.5 cursor-pointer" onClick={() => setMenuOpen(!isMenuOpen)} aria-label="Abrir menu">
                <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-2" : ""}`}></span>
                <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? "opacity-0" : ""}`}></span>
                <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? "-rotate-45 -translate-y-2": ""}`}></span>
            </button>

            {/* Menu dropdown para mobile: */}
            {isMenuOpen && (
                <nav className="md:hidden absolute top-20 md:right-5 right-0 md:w-36 w-30 flex flex-col items-center gap-5 py-4 z-50" style={{backgroundColor: '#0064c8'}}>
                    {nav_links.map((link) => (
                        <NavLink 
                        to={link.route}
                        key={link.route}
                        className={({ isActive }) => isActive ? "font-bold text-white border-b-2 border-b-amber-50" : "font-normal text-white hover:border-b-2 hover:border-b-black transition-colors duration-300 hover:text-[#c6c6c6]"}>
                            {link.label}
                        </NavLink>
                    ))}
                </nav>
            )}
        </header>
    )
}

export default Header