import './Footer.css'
import { BsInstagram , BsGithub} from 'react-icons/bs'

function Footer() {
    const contats = [
        {label: "E-MAIL", addres: "npec@gmail.com"},
        {label: "ENDEREÇO", addres: "Avenida Luís Eduardo Magalhães, nº 1305, Bairro Candeias, Vitória da Conquista - BA"},
        {label: "ATENDIMENTO", addres: "Segunda a sexta, 8h às 17h"}
    ]


    return (
        <footer className="m-auto bg-slate-800 h-200 md:h-100 lg:h-90 w-full mt-30 flex flex-col items-center text-white">
            {/* Div principal superior */}
            <div className='flex p-5 sm:p-5 md:pt-5 lg:pt-5 justify-around gap-5 lg:gap-20'>
                {/* Div "Missão e Visão" */}
                <div className='flex flex-col gap-2 flex-wrap'>
                    <h4 className='text-gray-500'>MISSÃO & VISÃO</h4>
                    {/* Missão */}
                   <div className='flex flex-wrap flex-col gap-1.5'>
                        <div className='pt-0.5 pb-0.5 pr-2 pl-2 max-w-15 border border-gray-500 rounded-sm mx-w-100'>
                            <h5 className='text-gray-500 titles'>Missão</h5>
                        </div>

                        <p className='text-white font'>Promover a formação de profissionais de Engenharia da Computação através de práticas inovadoras, pesquisa aplicada e projetos que agreguem valor técnico e social.</p>
                   </div>

                   <div className='horizontal-row'></div>

                    {/* Visão */}
                   <div className='flex flex-wrap flex-col gap-1.5'>
                        <div className='pt-0.5 pb-0.5 pr-2 pl-2 border border-gray-500 rounded-sm max-w-13'>
                            <h5 className='text-gray-500 titles'>Visão</h5>
                        </div>

                        <p className='text-white font'>Ser referência em excelência acadêmica e tecnológica, contribuindo para o desenvolvimento de soluções inovadoras que transformem positivamente a sociedade.</p>
                   </div>
                </div>

                <div className='vertical-row'></div>

                {/* Contato */}
                <div>
                    <h4 className='text-gray-500'>CONTATO</h4>
                    {contats.map((contat) => (
                        <div>
                            <label className='text-gray-500 titles'>{contat.label}</label>
                            <p className='text-white font'>{contat.addres}</p>
                        </div>
                    ))}

                    <div className='flex gap-5 mt-5'>
                        <a href='#instagram' target='_blank' rel='noreferrer' className='w-6 h-6 bg-gray-600 rounded-sm p-1 cursor-pointer hover:bg-gray-700'>
                            <BsInstagram className='text-gray-400' />
                        </a>
                        
                        <a href='#github' target='_blank' rel='noreferrer' className='w-6 h-6 bg-gray-600 rounded-sm p-1 cursor-pointer hover:bg-gray-700'>
                            <BsGithub className='text-gray-400' />
                        </a>
                    </div>
                </div>
            </div>

            <div className='horizontal-row'></div>

            {/* Div principal inferior */}
            <div className='flex justify-between gap-10 md:gap-40 lg:gap-100 mt-10 md:mt-5 lg:mt-3'>

                <p className='text-gray-500 font ml-1 self-center'>Engenharia da Computação</p>

                <p className="font-light font text-gray-600 self-center">© 2026 NPEC - Núcleo de Práticas em Engenharia da Computação</p>
            </div>
            
        </footer>
    )
}

export default Footer