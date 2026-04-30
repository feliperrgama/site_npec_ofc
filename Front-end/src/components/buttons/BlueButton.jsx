import { ArrowRight } from "lucide-react"

function BlueButton({ label, className = "" }) {
    return (
        <button className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-[#002057] to-[#0064c8] px-6 py-3 text-base font-semibold text-white transition duration-300 hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-[#0064c8] ${className}`}>
            {label}
            <ArrowRight className="w-4 h-4" />
        </button>
    )
}

export default BlueButton