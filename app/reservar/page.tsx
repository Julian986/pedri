import Link from 'next/link';

export default function ReservarPage() {
  return (
    <div className="min-h-[884px] bg-[#131313] pt-16 font-['Inter'] text-[#e5e2e1] antialiased">
        <header className="fixed top-0 z-50 w-full border-b border-[#434655] bg-[#131313]">
          <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#b5c4ff]" style={{ fontVariationSettings: "'FILL' 1" }}>
                domain
              </span>
              <span className="text-[32px] font-bold leading-[40px] tracking-tight text-[#b5c4ff]">Pedri</span>
            </div>
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/reservar" className="font-semibold text-[#b5c4ff]">Inicio</Link>
            <Link href="/explorar" className="text-[#c3c5d8] transition hover:text-[#b5c4ff]">Explorar</Link>
            <button className="flex items-center gap-1 text-[16px] leading-6 text-[#c3c5d8] transition hover:text-[#b5c4ff] active:scale-95">
              Ingresar
            </button>
          </nav>
          </div>
        </header>

        <main className="flex w-full flex-col">
          <section className="relative flex h-[600px] w-full items-center justify-center overflow-hidden bg-[#201f1f]">
            <div className="absolute inset-0 h-full w-full">
              <img
                alt="Luxury modern villa exterior at dusk"
                className="h-full w-full object-cover opacity-60"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWGi48oh_mOtbutkKEupwPFJxo3sMilFpnX5NRLq_HqqSlSJiC9OZ-1HUuC3YGSSKGyzxKAGaFd1OcbZgCif1wMe8n9xe3K7ZCcGD2T6yumD2NJlBi-e1d5MiikEXvZ3V0iI_6ENN4iJ2apgWxAdxGi8woldnRn7NATpe3iEGMB6Fstvn3m12naUI8ggMHnTNwrwvkLTs-Nvej_BeGNRPXtiDm7lpZ0BxzdMTZp_bTCGIDkgvbnuHloEzqQHRlyrG5nQrcs3R30Ive"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#131313]/40 to-transparent" />
            </div>

            <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-6 text-center">
              <h1 className="max-w-3xl text-[48px] font-bold leading-[56px] text-[#e5e2e1]">
                Descubrí estadías excepcionales
              </h1>

              <div className="flex w-full max-w-4xl flex-col items-end gap-2 rounded-lg border border-[#434655] bg-[#131313]/80 p-3 shadow-2xl backdrop-blur-md md:flex-row">
                <div className="flex w-full flex-col gap-1">
                  <label className="ml-2 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-[#c3c5d8]">
                    Ingreso
                  </label>
                  <div className="relative w-full">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8d90a1]">
                      calendar_month
                    </span>
                    <input
                      className="w-full rounded border border-[#8d90a1] bg-[#2a2a2a] py-3 pl-10 pr-3 text-[15px] font-medium text-[#e5e2e1] outline-none transition-colors focus:border-[#2d68ff] focus:ring-1 focus:ring-[#2d68ff]"
                      placeholder="Agregar fecha"
                      type="text"
                    />
                  </div>
                </div>

                <div className="flex w-full flex-col gap-1">
                  <label className="ml-2 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-[#c3c5d8]">
                    Salida
                  </label>
                  <div className="relative w-full">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8d90a1]">
                      calendar_month
                    </span>
                    <input
                      className="w-full rounded border border-[#8d90a1] bg-[#2a2a2a] py-3 pl-10 pr-3 text-[15px] font-medium text-[#e5e2e1] outline-none transition-colors focus:border-[#2d68ff] focus:ring-1 focus:ring-[#2d68ff]"
                      placeholder="Agregar fecha"
                      type="text"
                    />
                  </div>
                </div>

                <div className="flex w-full flex-col gap-1">
                  <label className="ml-2 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-[#c3c5d8]">
                    Huéspedes
                  </label>
                  <div className="relative w-full">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8d90a1]">
                      person
                    </span>
                    <select className="w-full appearance-none rounded border border-[#8d90a1] bg-[#2a2a2a] py-3 pl-10 pr-9 text-[15px] font-medium text-[#e5e2e1] outline-none transition-colors focus:border-[#2d68ff] focus:ring-1 focus:ring-[#2d68ff]">
                      <option>1 huésped</option>
                      <option>2 huéspedes</option>
                      <option>3+ huéspedes</option>
                    </select>
                    <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8d90a1]">
                      expand_more
                    </span>
                  </div>
                </div>

                <button className="flex h-[44px] w-full items-center justify-center gap-2 whitespace-nowrap rounded bg-[#2d68ff] px-10 text-[20px] font-semibold leading-7 text-[#fffcff] shadow-[0_4px_20px_rgba(45,104,255,0.3)] transition duration-200 hover:opacity-90 active:scale-95 md:w-auto">
                  <span className="material-symbols-outlined">search</span>
                  Buscar
                </button>
              </div>
            </div>
          </section>

          <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-16">
            <div className="flex items-end justify-between border-b border-[#353534] pb-3">
              <div>
                <h2 className="text-[32px] font-bold leading-[40px] text-[#e5e2e1]">Colección destacada</h2>
                <p className="mt-1 text-[16px] leading-6 text-[#c3c5d8]">
                  Propiedades seleccionadas por su ubicación, diseño y confort.
                </p>
              </div>
              <Link href="/explorar" className="flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.05em] text-[#b5c4ff] transition-colors hover:text-[#2d68ff]">
                Ver todas <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <article className="group relative flex min-h-[400px] flex-col overflow-hidden rounded-lg border border-[#434655] bg-[#131313] transition-colors hover:border-[#8d90a1] md:col-span-2">
                <div className="absolute inset-0 h-full w-full">
                  <img
                    alt="Modern coastal villa"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZiqoxUrwIJIWCBB049LK998fASochqgJSDdsyPxPojCGRb3z_DTF5h-mNfdPm-ZeS00Td8OR53k1sfEPaMGLv6-giCs5pfNoPrzWAXPK1IFbHZ4MRqFdLGFcW7By4vsYGQ3IR3tTOCGPcPiSWuNAo0KT9zegvZxlnHyvfJRuWBQ8A1GSHD2Px4qXq1AzrqN1aBOptbqUKXKMY790zhPZWEQxodzt7bU_Cz0eq7KsXTy9G4g2trJEu-8_qfw8df5eu2tHCMBCtFZFv"
                  />
                  <div className="absolute inset-0 bg-black/15 transition-colors duration-500 group-hover:bg-black/30" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#131313]/60 to-transparent" />
                </div>
                <div className="relative z-10 mt-auto flex flex-col gap-2 p-6">
                  <div className="flex items-start justify-between">
                    <h3 className="text-[20px] font-semibold leading-7 text-[#e5e2e1] drop-shadow-md">The Obsidian Edge</h3>
                    <div className="flex items-center gap-1 rounded bg-[#0e0e0e]/80 px-3 py-1 backdrop-blur">
                      <span className="material-symbols-outlined text-[16px] text-[#f9bd22]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                      <span className="text-[15px] font-medium text-[#e5e2e1]">4.98</span>
                    </div>
                  </div>
                  <p className="flex items-center gap-1 text-[16px] leading-6 text-[#c3c5d8]">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    Malibu, California
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-[15px] font-medium text-[#e5e2e1]">
                      <span className="text-[14px] text-[#c3c5d8]">Desde</span> ARS 2.400{" "}
                      <span className="text-[14px] text-[#c3c5d8]">/ noche</span>
                    </p>
                  </div>
                </div>
              </article>

              <article className="group relative flex min-h-[400px] flex-col overflow-hidden rounded-lg border border-[#434655] bg-[#131313] transition-colors hover:border-[#8d90a1]">
                <div className="absolute inset-0 h-full w-full">
                  <img
                    alt="Urban penthouse interior"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOPNFKM9ic8T11IiVNwCU3WwoUsrN_snJag1Mtqiv-vU53DRzkCwVL2vfBenCRUe6fbMtBiOLSa-Z3fX59pog09okk2VIr5ijqjzTPCubrA8Ny_TQL4OjCuni10oiM4_XA-XxX4AWTyiI4wmMB664APj4nOiwYet-5phDDVn3vWDP6NsVodM7b8VyySTGBLLALT85BSoaRcZq3wegd2mVqAhGGuc_We9zIRo0Crd92ru3wDegJnXJNWptOgsjDD3aDQFRc-4tlgjhU"
                  />
                  <div className="absolute inset-0 bg-black/15 transition-colors duration-500 group-hover:bg-black/30" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#131313]/60 to-transparent" />
                </div>
                <div className="relative z-10 mt-auto flex flex-col gap-2 p-6">
                  <div className="flex items-start justify-between">
                    <h3 className="text-[20px] font-semibold leading-7 text-[#e5e2e1] drop-shadow-md">Skyline Ascend</h3>
                    <div className="flex items-center gap-1 rounded bg-[#0e0e0e]/80 px-3 py-1 backdrop-blur">
                      <span className="material-symbols-outlined text-[16px] text-[#f9bd22]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                      <span className="text-[15px] font-medium text-[#e5e2e1]">4.95</span>
                    </div>
                  </div>
                  <p className="flex items-center gap-1 text-[16px] leading-6 text-[#c3c5d8]">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    New York City
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-[15px] font-medium text-[#e5e2e1]">
                      <span className="text-[14px] text-[#c3c5d8]">Desde</span> ARS 1.850{" "}
                      <span className="text-[14px] text-[#c3c5d8]">/ noche</span>
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section className="w-full border-y border-[#434655] bg-[#1c1b1b] py-16">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6">
              <div className="text-center">
                <h2 className="text-[32px] font-bold leading-[40px] text-[#e5e2e1]">Experiencias de huéspedes</h2>
                <p className="mx-auto mt-1 max-w-2xl text-[16px] leading-6 text-[#c3c5d8]">
                  Lo que más valoran quienes ya se alojaron con nosotros.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-6 rounded-lg border border-[#434655] bg-[#131313] p-10">
                  <div className="flex items-center gap-2 text-[#2d68ff]">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                    <span className="text-[12px] font-semibold uppercase tracking-[0.05em]">Huésped verificado</span>
                  </div>
                  <p className="text-lg italic leading-relaxed text-[#e5e2e1]">
                    "La atención al detalle fue excelente. Todo estuvo tal cual se mostraba: impecable, seguro y
                    muy cómodo. La experiencia fue clara y sin fricciones."
                  </p>
                  <div className="mt-auto flex items-center gap-3 border-t border-[#353534] pt-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#434655] bg-[#2a2a2a]">
                      <span className="text-[15px] font-medium text-[#c3c5d8]">JM</span>
                    </div>
                    <div>
                      <p className="text-[15px] font-medium text-[#e5e2e1]">Jameson M.</p>
                      <p className="text-[14px] leading-5 text-[#c3c5d8]">Se alojó en The Obsidian Edge</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6 rounded-lg border border-[#434655] bg-[#131313] p-10">
                  <div className="flex items-center gap-2 text-[#2d68ff]">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                    <span className="text-[12px] font-semibold uppercase tracking-[0.05em]">Huésped verificado</span>
                  </div>
                  <p className="text-lg italic leading-relaxed text-[#e5e2e1]">
                    "Muy fácil de reservar y con una atención impecable. Todo fue claro, rápido y profesional
                    de principio a fin."
                  </p>
                  <div className="mt-auto flex items-center gap-3 border-t border-[#353534] pt-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#434655] bg-[#2a2a2a]">
                      <span className="text-[15px] font-medium text-[#c3c5d8]">ER</span>
                    </div>
                    <div>
                      <p className="text-[15px] font-medium text-[#e5e2e1]">Elena R.</p>
                      <p className="text-[14px] leading-5 text-[#c3c5d8]">Se alojó en Skyline Ascend</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="w-full border-t border-[#434655] bg-[#0e0e0e]">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">
            <div className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#b5c4ff] opacity-80 transition-opacity hover:opacity-100">
              Pedri
            </div>
            <nav className="flex flex-wrap justify-center gap-6">
              <a className="text-[14px] leading-5 text-[#c3c5d8] transition-colors hover:text-[#e5e2e1]" href="#">
                Explorar
              </a>
              <a className="text-[14px] leading-5 text-[#c3c5d8] transition-colors hover:text-[#e5e2e1]" href="#">
                Cómo funciona
              </a>
              <a className="text-[14px] leading-5 text-[#c3c5d8] transition-colors hover:text-[#e5e2e1]" href="#">
                Soporte
              </a>
              <a className="text-[14px] leading-5 text-[#c3c5d8] transition-colors hover:text-[#e5e2e1]" href="#">
                Privacidad
              </a>
            </nav>
            <div className="text-center text-[14px] leading-5 text-[#c3c5d8] md:text-right">
              © 2024 Pedri. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
  );
}
