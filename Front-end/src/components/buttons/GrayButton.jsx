import { ChevronRight } from "lucide-react"

function GrayButton({ label, className = "" }) {
    return (
        <button className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-200 px-6 py-3 text-base font-semibold text-[#002057] transition duration-300 hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 ${className}`}>
            {label}
            <ChevronRight className="w-4 h-4" />
        </button>
    )
}

export default GrayButton