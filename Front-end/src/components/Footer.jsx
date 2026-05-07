import { BsInstagram, BsGithub } from 'react-icons/bs'

function Footer() {
  const contacts = [
    { label: "E-mail", value: "npec@gmail.com" },
    { label: "Endereço", value: "Av. Luís Eduardo Magalhães, 1305 — Candeias, Vitória da Conquista, BA" },
    { label: "Atendimento", value: "Seg–Sex, 8h às 17h" },
  ]

  return (
    <footer className="w-full bg-[#001230] text-white px-6 sm:px-10 pt-10 sm:pt-12 pb-6 sm:pb-7 font-mono">

      {/* Topo */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-8 pb-8 sm:pb-10 border-b border-[#1f1f1f]">

        {/* Marca */}
        <div className="shrink-0">
          <h2 className="text-sm font-normal tracking-wide text-[#e0e0e0]">NPEC</h2>
          <p className="text-[10px] tracking-[0.15em] text-[#3a3a3a] mt-1.5 uppercase font-light">
            Engenharia da Computação
          </p>
        </div>

        {/* Contatos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10">
          {contacts.map((c) => (
            <div key={c.label}>
              <label className="block text-[9px] tracking-[0.18em] text-[#333] uppercase mb-1.5">
                {c.label}
              </label>
              <p className="text-[11px] text-[#666] font-light leading-relaxed">
                {c.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Rodapé */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 pt-5">
        <span className="text-[10px] text-[#2e2e2e] tracking-wide font-light">
          © 2026 NPEC — Núcleo de Práticas em Engenharia da Computação
        </span>

        <div className="flex gap-3.5">
          <a href="#instagram" target="_blank" rel="noreferrer"
            className="flex items-center justify-center w-7 h-7 border border-[#1f1f1f] rounded-[3px] text-[#3a3a3a] hover:border-[#3a3a3a] hover:text-[#888] transition-colors">
            <BsInstagram size={13} />
          </a>
          <a href="#github" target="_blank" rel="noreferrer"
            className="flex items-center justify-center w-7 h-7 border border-[#1f1f1f] rounded-[3px] text-[#3a3a3a] hover:border-[#3a3a3a] hover:text-[#888] transition-colors">
            <BsGithub size={13} />
          </a>
        </div>
      </div>

    </footer>
  )
}

export default Footer