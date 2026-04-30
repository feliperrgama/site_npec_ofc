import './MainLogo.css'
import LogoNPEC from '../assets/logo2.png'

function MainLogo() {
    return (
        <img className="float-animation w-60 h-70 md:w-70 md:h-80 lg:w-80 lg:h-90 self-center border-0 rounded-4xl mt-10 mb-10 md:mb-20" src={LogoNPEC} style={{boxShadow: "rgba(0, 0, 0, 0.25) 0px 25px 50px -12px"}} alt="sla" />
    
    )
}

export default MainLogo