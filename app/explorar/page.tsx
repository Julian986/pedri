import Link from 'next/link';
import PublicBackLink from '@/components/PublicBackLink'

export default function ExplorarPage() {
  return (
    <div className="min-h-[884px] bg-[#131313] font-['Inter'] text-[#e5e2e1] antialiased">
      <header className="fixed top-0 z-50 w-full border-b border-[#434655] bg-[#131313]">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl text-[#b5c4ff]">domain</span>
            <span className="text-[32px] font-bold leading-[40px] tracking-tight text-[#b5c4ff]">Pedri</span>
          </div>
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/reservar" className="text-[#c3c5d8] transition hover:text-[#b5c4ff]">Inicio</Link>
            <Link href="/explorar" className="font-semibold text-[#b5c4ff]">Explorar</Link>
            <button className="text-[20px] font-semibold leading-7 text-[#c3c5d8] transition duration-200 hover:text-[#b5c4ff] active:scale-95">
              Ingresar
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 pb-10 pt-24">
        <PublicBackLink href="/reservar" className="mb-4 inline-flex items-center gap-1 text-sm text-[#b5c4ff] hover:underline">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Volver a inicio
        </PublicBackLink>

        <section className="mb-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <h1 className="mb-2 text-[32px] font-bold leading-[40px] text-[#e5e2e1]">Propiedades disponibles</h1>
            <p className="text-[16px] leading-6 text-[#c3c5d8]">
              Mostrando 4 alojamientos reales cargados en la base de datos.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 rounded-full border border-[#434655] bg-[#201f1f] px-4 py-2 text-[14px] leading-5 text-[#e5e2e1] transition-colors hover:bg-[#2a2a2a]">
              <span className="material-symbols-outlined text-[18px]">payments</span>
              Precio
              <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
            </button>
            <button className="flex items-center gap-2 rounded-full border border-[#434655] bg-[#201f1f] px-4 py-2 text-[14px] leading-5 text-[#e5e2e1] transition-colors hover:bg-[#2a2a2a]">
              <span className="material-symbols-outlined text-[18px]">home</span>
              Tipo
              <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
            </button>
            <button className="flex items-center gap-2 rounded-full border border-[#434655] bg-[#201f1f] px-4 py-2 text-[14px] leading-5 text-[#e5e2e1] transition-colors hover:bg-[#2a2a2a]">
              <span className="material-symbols-outlined text-[18px]">room_service</span>
              Comodidades
              <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
            </button>
            <button className="ml-auto flex items-center gap-2 rounded-full border border-[#b5c4ff] px-4 py-2 text-[14px] leading-5 text-[#b5c4ff] transition-colors hover:bg-[#b5c4ff]/10 lg:ml-0">
              <span className="material-symbols-outlined text-[18px]">tune</span>
              Más filtros
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <article className="group relative flex flex-col overflow-hidden rounded-xl border border-[#434655] bg-[#131313] md:col-span-2 md:flex-row">
            <div className="relative h-64 w-full overflow-hidden bg-[#201f1f] md:h-auto md:w-3/5">
              <img
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqHfkyEAOXp6FXjhMjXhVQFubCBR43GzHbGATQbOR3Ho0iv-Zoe3b_9M_RmxO2rFUwzP_2j96Z6efkFlFyySpEo1Yc_igXCzIdvzCuYI6DFYFXarpM1rPJvrpDK54hcRMF4lXW0GZFIx2xVEFUFGJ7o4fSbI-oGkA_Wixh7N69Ec-iNyDRCKTEbLrN7oepm0lG2j0ijYW4ra4HBss6FzDMoR4nICUTzH926gosui8IR8RYVvpW1gO5XwNlzQdOV6r-MQnMfUTs8kkI"
                alt="Yeso"
              />
              <div className="pointer-events-none absolute inset-0 bg-black/15" />
              <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full border border-[#434655] bg-[#131313]/80 px-3 py-1 shadow-sm backdrop-blur-md">
                <span className="material-symbols-outlined text-[14px] text-[#f9bd22]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                <span className="text-[15px] font-medium text-[#e5e2e1]">4.98</span>
              </div>
              <div className="absolute bottom-3 left-3 rounded border border-[#00a572]/20 bg-[#00a572]/10 px-2 py-1 text-[12px] font-semibold uppercase tracking-widest text-[#4edea3] backdrop-blur-sm">
                Anfitrión destacado
              </div>
            </div>

            <div className="relative z-10 flex w-full flex-col justify-between bg-[#131313] p-10 md:w-2/5">
              <div>
                <div className="mb-2 flex items-start justify-between">
                  <h2 className="pr-4 text-[20px] font-semibold leading-7 text-[#e5e2e1]">Yeso</h2>
                  <button className="text-[#8d90a1] transition-colors hover:text-[#b5c4ff]">
                    <span className="material-symbols-outlined">favorite_border</span>
                  </button>
                </div>
                <p className="mb-6 flex items-center gap-1 text-[16px] leading-6 text-[#c3c5d8]">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  01 abr → 05 abr · Particular
                </p>
                <div className="mb-10 flex gap-6 border-y border-[#434655]/30 py-3">
                  <div className="flex items-center gap-1 text-[14px] leading-5 text-[#c3c5d8]">
                  <span className="material-symbols-outlined text-[18px]">bed</span>4 camas
                  </div>
                  <div className="flex items-center gap-1 text-[14px] leading-5 text-[#c3c5d8]">
                  <span className="material-symbols-outlined text-[18px]">shower</span>3,5 baños
                  </div>
                  <div className="flex items-center gap-1 text-[14px] leading-5 text-[#c3c5d8]">
                    <span className="material-symbols-outlined text-[18px]">square_foot</span>390 m²
                  </div>
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-[28px] font-bold tracking-tight text-[#e5e2e1]">ARS 620.000</span>
                  <span className="text-[14px] leading-5 text-[#c3c5d8]">/ noche</span>
                </div>
                <Link href="/detalle?propiedad=yeso" className="flex items-center justify-center gap-2 rounded-lg bg-[#2d68ff] py-3 text-[16px] font-medium leading-6 text-[#fffcff] shadow-[0_4px_20px_rgba(45,104,255,0.0)] transition-all duration-300 hover:bg-[#b5c4ff] hover:text-[#00164e] hover:shadow-[0_4px_20px_rgba(45,104,255,0.3)]">
                  Ver detalle
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </article>

          <article className="group relative flex flex-col overflow-hidden rounded-xl border border-[#434655] bg-[#131313]">
            <div className="relative h-56 w-full overflow-hidden bg-[#201f1f]">
              <img
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBM8UdKTvKy6ckPJy5uXH-425YY2rn9T0DfIf9DKQnkEVMfQJWqjJyGtbUspWYuaFNa1wDLSbGg_ZA2MwtB3T6MVeLvaXvWrB_FVQsC4MsJtmYjKWCOp421jCPPFgc3PhcLgwsBWmJz3pTXQdfh8BmE_tKVNP_wLTzYFKjksX6ip94Rn8-EjgPJc_slwRE6a7Rt_7YxRcyvUmZh9i7UjU-fGqZKdGvSt6WZ2Wr4ezzJRPnHqi1aKxd8isgo3KsOEJCwVstuOwpBtot"
                alt="Graciana"
              />
              <div className="pointer-events-none absolute inset-0 bg-black/15" />
              <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-[#434655] bg-[#131313]/80 px-3 py-1 shadow-sm backdrop-blur-md">
                <span className="material-symbols-outlined text-[14px] text-[#f9bd22]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                <span className="text-[15px] font-medium text-[#e5e2e1]">4.85</span>
              </div>
            </div>
            <div className="flex flex-grow flex-col p-6">
              <div className="mb-2 flex items-start justify-between">
                <h3 className="truncate pr-2 text-[20px] font-semibold leading-7 text-[#e5e2e1]">Graciana</h3>
                <button className="shrink-0 text-[#8d90a1] transition-colors hover:text-[#b5c4ff]">
                  <span className="material-symbols-outlined">favorite_border</span>
                </button>
              </div>
              <p className="mb-6 flex items-center gap-1 text-[14px] leading-5 text-[#c3c5d8]">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                20 feb → 07 mar · Booking
              </p>
              <div className="mb-6 flex gap-3 border-b border-[#434655]/30 pb-6">
                <div className="flex items-center gap-1 text-[14px] leading-5 text-[#c3c5d8]">
                  <span className="material-symbols-outlined text-[16px]">bed</span>2 camas
                </div>
                <div className="flex items-center gap-1 text-[14px] leading-5 text-[#c3c5d8]">
                  <span className="material-symbols-outlined text-[16px]">shower</span>2 baños
                </div>
              </div>
              <div className="mt-auto flex items-center justify-between pt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-[22px] font-bold tracking-tight text-[#e5e2e1]">ARS 862.785</span>
                  <span className="text-[14px] leading-5 text-[#c3c5d8]">/ noche</span>
                </div>
                <Link href="/detalle?propiedad=graciana" className="rounded-lg border border-[#434655] px-4 py-2 text-[14px] font-medium leading-5 text-[#e5e2e1] transition-colors hover:bg-[#201f1f]">
                  Ver detalle
                </Link>
              </div>
            </div>
          </article>

          <article className="group relative flex flex-col overflow-hidden rounded-xl border border-[#434655] bg-[#131313]">
            <div className="relative h-56 w-full overflow-hidden bg-[#201f1f]">
              <img
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWDUFJCN7uMCdCCxb4j5HAl1tp1RsJwL_12-WBEtOxQpJVI3KZSBHDyD-sARuiP5sbmMesYuyBsPrDPT8SspVvmNeClSnt4FQpmr5RDQJ0-3iFPT0ixRVtz5mEcrl9Z7T8sDdx2Eb1Wz3gg1oUsAW6ayx4g58FB-j52wZoBsNqNTkR7DPHZeIsjWF5RtWl-B0eHuFkoVHUVCN1W8dVHZi2pQmDli-5SIgddDCH_XIdgWFtM7-uBD-b1Qluo8gbl5x1_Lq3oULohFBl"
                alt="Zenith Brutalist Villa"
              />
              <div className="pointer-events-none absolute inset-0 bg-black/15" />
              <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-[#434655] bg-[#131313]/80 px-3 py-1 shadow-sm backdrop-blur-md">
                <span className="material-symbols-outlined text-[14px] text-[#f9bd22]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                <span className="text-[15px] font-medium text-[#e5e2e1]">4.92</span>
              </div>
            </div>
            <div className="flex flex-grow flex-col p-6">
              <div className="mb-2 flex items-start justify-between">
                <h3 className="truncate pr-2 text-[20px] font-semibold leading-7 text-[#e5e2e1]">Chiquito</h3>
                <button className="shrink-0 text-[#8d90a1] transition-colors hover:text-[#b5c4ff]">
                  <span className="material-symbols-outlined">favorite_border</span>
                </button>
              </div>
              <p className="mb-6 flex items-center gap-1 text-[14px] leading-5 text-[#c3c5d8]">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                20 feb → 25 feb · Booking
              </p>
              <div className="mb-6 flex gap-3 border-b border-[#434655]/30 pb-6">
                <div className="flex items-center gap-1 text-[14px] leading-5 text-[#c3c5d8]">
                  <span className="material-symbols-outlined text-[16px]">bed</span>5 camas
                </div>
                <div className="flex items-center gap-1 text-[14px] leading-5 text-[#c3c5d8]">
                  <span className="material-symbols-outlined text-[16px]">shower</span>4 baños
                </div>
              </div>
              <div className="mt-auto flex items-center justify-between pt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-[22px] font-bold tracking-tight text-[#e5e2e1]">ARS 542.000</span>
                  <span className="text-[14px] leading-5 text-[#c3c5d8]">/ noche</span>
                </div>
                <Link href="/detalle?propiedad=chiquito" className="rounded-lg border border-[#434655] px-4 py-2 text-[14px] font-medium leading-5 text-[#e5e2e1] transition-colors hover:bg-[#201f1f]">
                  Ver detalle
                </Link>
              </div>
            </div>
          </article>

          <article className="group relative flex flex-col overflow-hidden rounded-xl border border-[#434655] bg-[#131313]">
            <div className="relative h-56 w-full overflow-hidden bg-[#201f1f]">
              <img
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVuow9Hwp56p1Y_ysj55kVFtPRbreusTxdhI2cX4V9mnTZFB8KxCN78FvaL5v0SS-T2onBj84Hc5AfwPCSR2cD6wzvqJuIxw9AKgupe4PwCoooYoDtZoyaWcL-Z0IZAG6qFX8I34uqixkXaN-e7WxXJj_db6xnmgmxp9aoG7E4bJ02reV7zX40ZDnz1MJ7Pa5fQUoKH-7e0Sw6Ln4cRPWzj9qapACem1OiADd8UNdBxxPF2UW5LjgLLdH67uiFoIxaVBBXN6ELjZhy"
                alt="Maricarmen"
              />
              <div className="pointer-events-none absolute inset-0 bg-black/15" />
              <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-[#434655] bg-[#131313]/80 px-3 py-1 shadow-sm backdrop-blur-md">
                <span className="material-symbols-outlined text-[14px] text-[#f9bd22]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                <span className="text-[15px] font-medium text-[#e5e2e1]">4.75</span>
              </div>
            </div>
            <div className="flex flex-grow flex-col p-6">
              <div className="mb-2 flex items-start justify-between">
                <h3 className="truncate pr-2 text-[20px] font-semibold leading-7 text-[#e5e2e1]">Maricarmen</h3>
                <button className="shrink-0 text-[#8d90a1] transition-colors hover:text-[#b5c4ff]">
                  <span className="material-symbols-outlined">favorite_border</span>
                </button>
              </div>
              <p className="mb-6 flex items-center gap-1 text-[14px] leading-5 text-[#c3c5d8]">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                14 feb → 20 feb · Booking
              </p>
              <div className="mb-6 flex gap-3 border-b border-[#434655]/30 pb-6">
                <div className="flex items-center gap-1 text-[14px] leading-5 text-[#c3c5d8]">
                  <span className="material-symbols-outlined text-[16px]">bed</span>1 cama
                </div>
                <div className="flex items-center gap-1 text-[14px] leading-5 text-[#c3c5d8]">
                  <span className="material-symbols-outlined text-[16px]">shower</span>1 baño
                </div>
              </div>
              <div className="mt-auto flex items-center justify-between pt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-[22px] font-bold tracking-tight text-[#e5e2e1]">ARS 484.454</span>
                  <span className="text-[14px] leading-5 text-[#c3c5d8]">/ noche</span>
                </div>
                <Link href="/detalle?propiedad=maricarmen" className="rounded-lg border border-[#434655] px-4 py-2 text-[14px] font-medium leading-5 text-[#e5e2e1] transition-colors hover:bg-[#201f1f]">
                  Ver detalle
                </Link>
              </div>
            </div>
          </article>
        </div>
      </main>

      <footer className="mt-auto border-t border-[#434655] bg-[#0e0e0e]">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">
          <span className="text-[14px] leading-5 text-[#c3c5d8]">© 2024 Pedri. All rights reserved.</span>
          <div className="flex gap-6 text-[14px] leading-5">
            <a className="text-[#c3c5d8] opacity-80 transition hover:text-[#e5e2e1] hover:opacity-100" href="#">
              Explorar
            </a>
            <a className="text-[#c3c5d8] opacity-80 transition hover:text-[#e5e2e1] hover:opacity-100" href="#">
              Cómo funciona
            </a>
            <a className="text-[#c3c5d8] opacity-80 transition hover:text-[#e5e2e1] hover:opacity-100" href="#">
              Soporte
            </a>
            <a className="text-[#c3c5d8] opacity-80 transition hover:text-[#e5e2e1] hover:opacity-100" href="#">
              Privacidad
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
