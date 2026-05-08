import Link from 'next/link';
import PublicBackLink from '@/components/PublicBackLink'

type DetalleSearchParams = {
  propiedad?: string
}

const PROPIEDADES = {
  yeso: {
    nombre: 'Yeso',
    anfitrion: 'Pe',
    imagenAnfitrion: 'https://res.cloudinary.com/dzoupwn0e/image/upload/v1778269259/foto_pedri_hrf5a2.webp',
  },
  graciana: {
    nombre: 'Graciana',
    anfitrion: 'Lorena',
    imagenAnfitrion: 'https://res.cloudinary.com/dzoupwn0e/image/upload/v1770817655/unnamed_57_owg8so.webp',
  },
  chiquito: {
    nombre: 'Chiquito',
    anfitrion: 'Sofia',
    imagenAnfitrion: 'https://res.cloudinary.com/dzoupwn0e/image/upload/v1770812260/unnamed_47_xwkpwb.webp',
  },
  maricarmen: {
    nombre: 'Maricarmen',
    anfitrion: 'Lucas',
    imagenAnfitrion: 'https://res.cloudinary.com/dzoupwn0e/image/upload/v1770779838/unnamed_41_nwufyw.webp',
  },
} as const

export default async function DetallePage({
  searchParams,
}: {
  searchParams: Promise<DetalleSearchParams>
}) {
  const params = await searchParams
  const propiedadKey = (params.propiedad || 'yeso').toLowerCase() as keyof typeof PROPIEDADES
  const propiedad = PROPIEDADES[propiedadKey] ?? PROPIEDADES.yeso

  return (
    <div className="min-h-[884px] bg-[#131313] text-[#e5e2e1]">
      <header className="fixed top-0 z-50 w-full border-b border-[#434655] bg-[#131313]">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2 text-[#b5c4ff]">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              domain
            </span>
            <span className="text-[32px] font-bold tracking-tight">Pedri</span>
          </div>
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/reservar" className="text-[#c3c5d8] transition hover:text-[#b5c4ff]">Inicio</Link>
            <Link href="/explorar" className="font-semibold text-[#b5c4ff]">Explorar</Link>
            <button className="text-[16px] text-[#c3c5d8] transition hover:text-[#b5c4ff]">Ingresar</button>
          </nav>
        </div>
      </header>

      <main className="mx-auto mb-16 w-full max-w-7xl px-6 py-10 pt-24 lg:mb-0">
        <PublicBackLink href="/explorar" className="mb-4 inline-flex items-center gap-1 text-sm text-[#b5c4ff] hover:underline">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Volver a explorar
        </PublicBackLink>

        <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="mb-2 text-[32px] font-bold">{propiedad.nombre}</h1>
            <div className="flex flex-wrap items-center gap-2 text-[14px] text-[#c3c5d8]">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                4.98 (124 reseñas)
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">location_on</span>
                Ibiza, Islas Baleares, España
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1 rounded border border-[#434655] px-3 py-2 text-[14px] hover:bg-[#2a2a2a]">
              <span className="material-symbols-outlined text-sm">share</span> Compartir
            </button>
            <button className="flex items-center gap-1 rounded border border-[#434655] px-3 py-2 text-[14px] hover:bg-[#2a2a2a]">
              <span className="material-symbols-outlined text-sm">favorite_border</span> Guardar
            </button>
          </div>
        </div>

        <div className="mb-10 grid h-[400px] grid-cols-1 gap-2 md:h-[500px] md:grid-cols-4 md:grid-rows-2">
          <div className="relative overflow-hidden rounded md:col-span-2 md:row-span-2">
            <img
              alt="Main property view"
              className="h-full w-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0ZqpQ1W_9JgB4MM2UrLbjYarVv0lTaf8q-1rA3U5pkBC0Ees4_m0t4DVvGlzrY7ny3Zwz6FV6fWyxzALSaOidGy99hfNpCsAHHjM3YdzDA5H3yPX3Ta-Ijskg1BZqrK2c5f07GCHdjx_Rm4KfIHIOd_PMxjE1xSMGZ3TRY7DG4pRqNfyJSwg4fFQlS83JccpUpqg0qXWVXB1zwjqrw7nYBcxCYhpTs2PDKDif92RSlwHfRKgVuQT0tZfKn5Nc1PqoRn-BLrtQHEuf"
            />
            <div className="absolute inset-0 bg-black/15" />
          </div>
          <div className="relative hidden overflow-hidden rounded md:block">
            <img
              alt="Living room"
              className="h-full w-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZ277_HqZqT268_17omGVedC2134dbYOXNgiAfMPUAA7ONkoyQ37O3Op3BgnIvMDXcZr9DfWjl3lQEN5uvpeKuYeOwfeIxcEg06YTyg0PbWgLQvxL1HEQnY1_RbALjhPrpmp0rTxYDaljpU065HKpKyzZSUUl5oa5HSg2hViC2eB5o87RhmNFxF2ynMJMgOAuv0t_9wuJQEMgd4vfvdjuOxVVj7imCZQ8ZmO2RH4q2FQzDx-1KJjuc9ZR1UEn89UBFKAfSmgJUEYTf"
            />
            <div className="absolute inset-0 bg-black/15" />
          </div>
          <div className="relative hidden overflow-hidden rounded md:block">
            <img
              alt="Bedroom"
              className="h-full w-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAeuqqheIefyesPv-bVBmAfyRfJvs0GzSs2iBxODgbyUoy-C4PE7huaGfSJ55IXMJjkq-2PxnetOfRoo7F0WqJm97-7LGxEHpXUguLrJnRtoE2cnXNnoUXjnJIrKHpLsE1Jm8tWfmTsSy0U1g1HwvCnCfU6pNwni_uzxfR72VCbOMtYPy2lCeiq_5QsgtDTqE6Ii_m5QoALa2rkY7u89L87a21apKTDaYSuY_CEWRAkCgvcBm88CTo6rKIzbKgL5nk2At7F3cjt3cz6"
            />
            <div className="absolute inset-0 bg-black/15" />
          </div>
          <div className="relative hidden overflow-hidden rounded md:block">
            <img
              alt="Bathroom"
              className="h-full w-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBH6fo3xw0GhG5xoSCAbVb47NY1Wfn4CP5e6aqhuenGXdgGxqdAjdXFXuvFbRdb2HJWGiTMnjC4PuH8654RLdP1sffAhOs4EgxCHKcbDoRe_1x8vS0CcAbCdHQ3sbFLX_V5hE1OBvHs_zjTBxvZyf-VNJJmUrxe0nViQ_Gppfp28SZSzE1vMfEyvdM68PNN3IrbyPITO9UHHyJtga5cXGVBXBpcvryQw832h1jY_ghPQ0bE1Vr350r8n11Wie8BHWIOVf6rvfsW-ufL"
            />
            <div className="absolute inset-0 bg-black/15" />
          </div>
          <div className="relative hidden overflow-hidden rounded md:block">
            <img
              alt="Outdoor area"
              className="h-full w-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsKMtlUOnYk5Mt_dbrOq3hqjfCeT0WcxwBH5r9S299HEwBsNSiO6nHfCMt6FFv8M-qJY0D_zy5AyhOhyaSD4xeMJpheqLuPwISmFkGXPc6OEXn6L67bg5KJhPuD2Rkmm1lMtiBBsXA1lpQOUU3w2Cd816pmY-LCushLi6rqgXX9D4H4aPtMugJvrIReoIscUSHi2Qcf5orE2yVYY9hUKc1xZlXfKVYkHxrxyTk2nWyFDMGTroeNuBs9naqL6EMYi0xH7gGrH5Sq46g"
            />
            <div className="absolute inset-0 bg-black/15" />
            <button className="absolute bottom-3 right-3 flex items-center gap-1 rounded border border-[#434655] bg-[#131313]/90 px-3 py-1 text-[12px] font-semibold uppercase tracking-widest hover:bg-[#131313]">
              <span className="material-symbols-outlined text-sm">grid_view</span> Ver todas las fotos
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="flex flex-col gap-10 lg:col-span-8">
            <div className="flex items-center justify-between border-b border-[#434655] pb-6">
              <div>
                <h2 className="mb-1 text-[20px] font-semibold">Anfitrión: {propiedad.anfitrion}</h2>
                <p className="text-[14px] text-[#c3c5d8]">10 huéspedes · 5 dormitorios · 6 camas · 5,5 baños</p>
              </div>
              <div className="h-12 w-12 overflow-hidden rounded-full border border-[#434655]">
                <img
                  alt="Host profile"
                  className="h-full w-full object-cover"
                  src={propiedad.imagenAnfitrion}
                />
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-[20px] font-semibold">Sobre este alojamiento</h3>
              <div className="space-y-3 text-[16px] text-[#c3c5d8]">
                <p>
                  Viví una experiencia de lujo en {propiedad.nombre}. Esta propiedad combina a la perfección interiores y
                  exteriores, con vistas panorámicas al Mediterráneo desde casi todos los ambientes.
                </p>
                <p>
                  Diseñada para priorizar confort y estilo, su interior minimalista de alto contraste enmarca el paisaje
                  costero y crea una atmósfera moderna y relajante.
                </p>
              </div>
              <button className="mt-3 flex items-center gap-1 text-[14px] text-[#b5c4ff] hover:underline">
                Ver más <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>

            <div className="border-b border-[#434655] pb-6">
              <h3 className="mb-6 text-[20px] font-semibold">Qué ofrece este lugar</h3>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex items-center gap-3 text-[16px]"><span className="material-symbols-outlined text-[#c3c5d8]">wifi</span> WiFi rápida (500 Mbps)</div>
                <div className="flex items-center gap-3 text-[16px]"><span className="material-symbols-outlined text-[#c3c5d8]">pool</span> Piscina infinita privada</div>
                <div className="flex items-center gap-3 text-[16px]"><span className="material-symbols-outlined text-[#c3c5d8]">ac_unit</span> Aire acondicionado central</div>
                <div className="flex items-center gap-3 text-[16px]"><span className="material-symbols-outlined text-[#c3c5d8]">directions_car</span> Estacionamiento gratuito</div>
                <div className="flex items-center gap-3 text-[16px]"><span className="material-symbols-outlined text-[#c3c5d8]">kitchen</span> Cocina equipada premium</div>
                <div className="flex items-center gap-3 text-[16px]"><span className="material-symbols-outlined text-[#c3c5d8]">tv</span> Smart TV de 75&quot;</div>
              </div>
              <button className="mt-6 rounded border border-[#434655] px-6 py-3 text-[14px] hover:bg-[#2a2a2a]">
                Ver las 42 comodidades
              </button>
            </div>

            <div>
              <h3 className="mb-3 text-[20px] font-semibold">Dónde vas a estar</h3>
              <p className="mb-6 text-[14px] text-[#c3c5d8]">Ibiza, Islas Baleares, España</p>
              <div className="relative h-64 w-full overflow-hidden rounded border border-[#434655] bg-[#2a2a2a]">
                <div className="absolute inset-0 flex items-center justify-center text-[#c3c5d8]">
                  <span className="material-symbols-outlined text-[32px]">map</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:col-span-4 lg:block">
            <div className="sticky top-[100px] rounded-lg border border-[#434655] bg-[#131313] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <span className="text-[32px] font-bold">ARS 155.000</span>
                  <span className="text-[14px] text-[#c3c5d8]">/ noche</span>
                </div>
                <div className="flex items-center gap-1 text-[14px] text-[#c3c5d8]">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                  4.98
                </div>
              </div>

              <div className="mb-6 overflow-hidden rounded border border-[#434655] bg-[#131313]">
                <div className="flex border-b border-[#434655]">
                  <div className="flex-1 cursor-pointer border-r border-[#434655] p-3 transition-colors hover:bg-[#2a2a2a]">
                    <div className="mb-1 text-[12px] font-semibold uppercase tracking-widest text-[#c3c5d8]">Ingreso</div>
                    <div className="text-[14px]">01/04/2026</div>
                  </div>
                  <div className="flex-1 cursor-pointer p-3 transition-colors hover:bg-[#2a2a2a]">
                    <div className="mb-1 text-[12px] font-semibold uppercase tracking-widest text-[#c3c5d8]">Salida</div>
                    <div className="text-[14px]">05/04/2026</div>
                  </div>
                </div>
                <div className="flex cursor-pointer items-center justify-between p-3 transition-colors hover:bg-[#2a2a2a]">
                  <div>
                    <div className="mb-1 text-[12px] font-semibold uppercase tracking-widest text-[#c3c5d8]">Huéspedes</div>
                    <div className="text-[14px]">2 huéspedes</div>
                  </div>
                  <span className="material-symbols-outlined">expand_more</span>
                </div>
              </div>

              <Link href="/finalizar" className="mb-3 flex w-full items-center justify-center rounded bg-[#2d68ff] py-3 text-[20px] font-semibold text-[#fffcff] shadow-[0_4px_20px_rgba(45,104,255,0.3)] transition-colors hover:bg-[#0050e3]">
                Reservar ahora
              </Link>
              <p className="mb-6 text-center text-[14px] text-[#c3c5d8]">Todavía no se realiza ningún cobro</p>

              <div className="mb-6 space-y-3 border-b border-[#434655] pb-6 text-[14px]">
                <div className="flex justify-between">
                  <span className="cursor-pointer text-[#c3c5d8] underline hover:text-[#e5e2e1]">ARS 155.000 x 4 noches</span>
                  <span>ARS 620.000</span>
                </div>
                <div className="flex justify-between">
                  <span className="cursor-pointer text-[#c3c5d8] underline hover:text-[#e5e2e1]">Comisión Pedri</span>
                  <span>ARS 186.000</span>
                </div>
                <div className="flex justify-between">
                  <span className="cursor-pointer text-[#c3c5d8] underline hover:text-[#e5e2e1]">Monto propietario</span>
                  <span>ARS 434.000</span>
                </div>
              </div>

              <div className="flex justify-between text-[20px] font-semibold">
                <span>Total</span>
                <span>ARS 620.000</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 z-40 flex w-full items-start justify-between gap-3 border-t border-[#434655] bg-[#131313] p-6 shadow-[0_-8px_30px_rgb(0,0,0,0.5)] lg:hidden">
        <div>
          <div className="whitespace-nowrap text-[29px] font-bold leading-tight">
            ARS 155.000 <span className="text-[12px] font-medium text-[#c3c5d8]">/ noche</span>
          </div>
          <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-[#434655] bg-[#1a1a1a] px-2.5 py-0.5 text-[12px] text-[#c3c5d8]">
            <span className="material-symbols-outlined text-[13px]">calendar_month</span>
            01 abr - 05 abr
          </div>
        </div>
        <Link href="/finalizar" className="rounded bg-[#2d68ff] px-8 py-2.5 text-[18px] font-semibold text-[#fffcff] shadow-[0_4px_20px_rgba(45,104,255,0.3)] transition-colors hover:bg-[#0050e3]">
          Reservar
        </Link>
      </div>

      <footer className="w-full border-t border-[#434655] bg-[#0e0e0e] pb-24 lg:pb-0">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">
          <span className="text-[12px] font-semibold uppercase tracking-widest text-[#b5c4ff] opacity-80">
            © 2024 Pedri. Todos los derechos reservados.
          </span>
          <div className="flex gap-6 text-[14px] text-[#c3c5d8]">
            <a className="opacity-80 transition hover:text-[#e5e2e1] hover:opacity-100" href="#">Explorar</a>
            <a className="opacity-80 transition hover:text-[#e5e2e1] hover:opacity-100" href="#">Cómo funciona</a>
            <a className="opacity-80 transition hover:text-[#e5e2e1] hover:opacity-100" href="#">Soporte</a>
            <a className="opacity-80 transition hover:text-[#e5e2e1] hover:opacity-100" href="#">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

