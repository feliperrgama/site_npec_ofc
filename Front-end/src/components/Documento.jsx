import { FileText, Download } from 'lucide-react'
import "../pages/editais.css"

function Documento( {title, description, archive_name, href, className} ) {

    return (
        <div className={`flex flex-col flex-wrap gap-6 h-90 md:h-70 w-120 rounded-2xl p-6 text-white ${className || ""}`} style={{backgroundImage: "linear-gradient(to right, #002057, #0064c8)"}}>
            <div className='bg-[#314F7D] w-12 h-12 rounded-xl flex justify-center items-center'>
                <FileText className='o'/>
            </div>

            <div className='flex flex-col gap-3'>
                <h3 className='font-bold text-xl'>{title}</h3>

                <p>{description}</p>
            </div>

            <div className='flex gap-2 mt-auto'>
                <a className='hover:underline' href={href} download={archive_name}>Download</a>
                <Download />
            </div>
        </div>
    )
}

export default Documento