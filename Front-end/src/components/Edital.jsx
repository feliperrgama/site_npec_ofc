import { FileText, Download } from 'lucide-react'
import "../pages/editais.css"
import axios from 'axios'
import { useState } from 'react'

function Edital({ title, description, archive_name, href, className }) {
    const [downloading, setDownloading] = useState(false)
    const [error, setError] = useState('')

    const handleDownload = async (e) => {
        e.preventDefault()
        setDownloading(true)
        setError('')

        try {
            const response = await axios.get(href, {
                responseType: 'blob'
            })

            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', archive_name || 'documento.pdf')
            document.body.appendChild(link)
            link.click()
            link.parentNode.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (err) {
            console.error('Erro ao baixar arquivo:', err)
            setError('Não foi possível baixar o arquivo. Tente novamente.')
        } finally {
            setDownloading(false)
        }
    }

    return (
        <div className={`flex min-h-[20rem] w-full max-w-[40rem] flex-col gap-6 rounded-2xl p-6 text-white shadow-lg sm:p-8 ${className || ""}`} style={{backgroundImage: "linear-gradient(to right, #002057, #0064c8)"}}>
            <div className='bg-[#314F7D] w-12 h-12 rounded-xl flex items-center justify-center'>
                <FileText className='w-6 h-6' />
            </div>

            <div className='flex flex-1 flex-col gap-3'>
                <h3 className='text-xl font-bold leading-tight sm:text-2xl'>{title}</h3>
                <p className='text-sm leading-6 text-slate-100 sm:text-base'>{description}</p>
            </div>

            {error && (
                <p role="alert" className='text-sm text-red-200 -mt-2'>{error}</p>
            )}

            <div className='mt-auto'>
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className='hover:underline flex items-center gap-2 text-white disabled:opacity-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded'
                >
                    <Download className='w-4 h-4' />
                    {downloading ? 'Baixando...' : 'Baixar PDF'}
                </button>
            </div>
        </div>
    )
}

export default Edital
