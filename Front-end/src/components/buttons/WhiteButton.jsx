function WhiteButton({ label}) {
    return (
        <button className="rounded-2xl flex items-center cursor-pointer w-46 h-15 self-center text-center indent-8 transition-all duration-300 hover:scale-105 border-2" style={{color: "#002057"}}>
            {label}
        </button>
    )
}

export default WhiteButton