import Link from 'next/link';
import PublicBackLink from '@/components/PublicBackLink'
import TrackedButton from '@/components/TrackedButton'

export const metadata = {
  title: 'Finalizar reserva',
  description: 'Completá tus datos y confirmá el pago de tu estadía.',
}

export default function FinalizarPage() {
  return (
    <div className="min-h-[884px] bg-[#131313] text-[#e5e2e1] antialiased">
      <header className="sticky top-0 z-50 w-full border-b border-[#434655] bg-[#131313]">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[28px] text-[#b5c4ff]">domain</span>
            <span className="text-[32px] font-bold tracking-tight text-[#b5c4ff]">Pedri</span>
          </div>
          <nav className="flex items-center text-sm">
            <TrackedButton eventName="ingresar_click" location="finalizar_header" className="px-1 text-[19px] font-extrabold leading-6 text-[#b5c4ff] transition duration-200 hover:text-[#d0daff] active:scale-95">
              <span>Ingresar</span>
            </TrackedButton>
          </nav>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 py-10 md:grid-cols-12">
        <div className="flex flex-col gap-10 md:col-span-7 lg:col-span-8">
          <div className="flex flex-col gap-1.5">
            <PublicBackLink href="/detalle" className="inline-flex w-fit items-center gap-1 text-sm text-[#b5c4ff] hover:underline">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Volver a detalle
            </PublicBackLink>

            <div className="flex flex-col gap-2">
              <h1 className="text-[32px] font-bold">Confirmá tu reserva</h1>
              <p className="text-[16px] text-[#c3c5d8]">
                Revisá tus datos y completá el pago para asegurar tu estadía.
              </p>
            </div>
          </div>

          <section className="flex flex-col gap-6">
            <h2 className="text-[20px] font-semibold">Datos del huésped</h2>
            <div className="grid grid-cols-1 gap-6 rounded-lg border border-[#353534] bg-[#201f1f] p-6 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] text-[#c3c5d8]" htmlFor="firstName">Nombre</label>
                <input id="firstName" type="text" placeholder="Tu nombre" className="w-full rounded border border-[#353534] bg-[#1c1b1b] px-3 py-[10px] text-[16px] text-[#e5e2e1] outline-none transition focus:border-[#2d68ff] focus:ring-1 focus:ring-[#2d68ff]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] text-[#c3c5d8]" htmlFor="lastName">Apellido</label>
                <input id="lastName" type="text" placeholder="Tu apellido" className="w-full rounded border border-[#353534] bg-[#1c1b1b] px-3 py-[10px] text-[16px] text-[#e5e2e1] outline-none transition focus:border-[#2d68ff] focus:ring-1 focus:ring-[#2d68ff]" />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-[14px] text-[#c3c5d8]" htmlFor="email">Correo electrónico</label>
                <input id="email" type="email" placeholder="nombre@correo.com" className="w-full rounded border border-[#353534] bg-[#1c1b1b] px-3 py-[10px] text-[16px] text-[#e5e2e1] outline-none transition focus:border-[#2d68ff] focus:ring-1 focus:ring-[#2d68ff]" />
                <p className="mt-1 text-[14px] text-[#8d90a1]">Te enviaremos aquí la confirmación de la reserva.</p>
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-[14px] text-[#c3c5d8]" htmlFor="phone">Teléfono</label>
                <div className="relative flex">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8d90a1]" style={{ fontSize: 20 }}>
                    call
                  </span>
                  <input id="phone" type="tel" placeholder="+54 9 11 1234 5678" className="w-full rounded border border-[#353534] bg-[#1c1b1b] py-[10px] pl-10 pr-3 text-[16px] text-[#e5e2e1] outline-none transition focus:border-[#2d68ff] focus:ring-1 focus:ring-[#2d68ff]" />
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <h2 className="text-[20px] font-semibold">Método de pago</h2>
            <div className="flex flex-col gap-6 rounded-lg border border-[#353534] bg-[#201f1f] p-6">
              <div className="grid grid-cols-2 gap-3">
                <label className="group relative cursor-pointer">
                  <input type="radio" name="payment_method" value="card" defaultChecked className="peer sr-only" />
                  <div className="flex items-center gap-3 rounded border border-[#353534] bg-[#1c1b1b] p-3 transition-all group-hover:border-[#8d90a1] peer-checked:border-[#2d68ff] peer-checked:bg-[rgba(45,104,255,0.05)]">
                    <span className="material-symbols-outlined text-[#c3c5d8] peer-checked:text-[#2d68ff]">credit_card</span>
                    <span className="text-[16px] font-medium">Tarjeta de crédito</span>
                    <span className="material-symbols-outlined ml-auto text-[#2d68ff] opacity-0 transition-opacity peer-checked:opacity-100" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                  </div>
                </label>
                <label className="group relative cursor-pointer">
                  <input type="radio" name="payment_method" value="wallet" className="peer sr-only" />
                  <div className="flex items-center gap-3 rounded border border-[#353534] bg-[#1c1b1b] p-3 transition-all group-hover:border-[#8d90a1] peer-checked:border-[#2d68ff] peer-checked:bg-[rgba(45,104,255,0.05)]">
                    <span className="material-symbols-outlined text-[#c3c5d8] peer-checked:text-[#2d68ff]">account_balance_wallet</span>
                    <span className="text-[16px] font-medium">Billetera digital</span>
                    <span className="material-symbols-outlined ml-auto text-[#2d68ff] opacity-0 transition-opacity peer-checked:opacity-100" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                  </div>
                </label>
              </div>

              <div className="mt-2 flex flex-col gap-6 border-t border-[#353534] pt-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] text-[#c3c5d8]" htmlFor="cardNumber">Número de tarjeta</label>
                  <div className="relative flex items-center">
                    <input id="cardNumber" type="text" placeholder="0000 0000 0000 0000" className="w-full rounded border border-[#353534] bg-[#1c1b1b] py-[10px] pl-3 pr-10 tracking-widest text-[#e5e2e1] outline-none transition focus:border-[#2d68ff] focus:ring-1 focus:ring-[#2d68ff]" />
                    <span className="material-symbols-outlined pointer-events-none absolute right-3 text-[#8d90a1]">lock</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[14px] text-[#c3c5d8]" htmlFor="expiry">Vencimiento</label>
                    <input id="expiry" type="text" placeholder="MM/YY" className="w-full rounded border border-[#353534] bg-[#1c1b1b] px-3 py-[10px] text-center text-[#e5e2e1] outline-none transition focus:border-[#2d68ff] focus:ring-1 focus:ring-[#2d68ff]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-1 text-[14px] text-[#c3c5d8]" htmlFor="cvc">
                      CVC
                      <span className="material-symbols-outlined cursor-help text-[#8d90a1]" style={{ fontSize: 16 }} title="3 o 4 dígitos al dorso de la tarjeta">
                        info
                      </span>
                    </label>
                    <input id="cvc" type="text" placeholder="123" className="w-full rounded border border-[#353534] bg-[#1c1b1b] px-3 py-[10px] text-center text-[#e5e2e1] outline-none transition focus:border-[#2d68ff] focus:ring-1 focus:ring-[#2d68ff]" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="relative md:col-span-5 lg:col-span-4">
          <div className="sticky top-[104px] flex flex-col gap-6 rounded-lg border border-[#353534] bg-[#201f1f] p-6">
            <div className="flex items-center gap-6 border-b border-[#353534] pb-6">
              <div className="h-20 w-20 shrink-0 rounded bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDI8CUT31KMiz4cpiddaPWzpdqTbikZZScYk7VGSNFy62b_1L8YFDioawm5BgtQtwPV9sjMEBDt44rV4ywrTC2uX6YPmyTJ5UpDpyi0p78-or5f2m-f8VJ92MeUKSRPo1oLh8SYJKjFsypqO8eUNlVTPucNpLhiYGA_SFN3F2Z1ULJeFe8vD9IHQuo7umNonrXvk6KSXV3AX_ASjcotOp21MNvnq-rRiSbUeX1dXl2lDLCLQtxROxtYhCnEw74bTgE6CMTaQwjtekyH')" }} />
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-semibold uppercase tracking-widest text-[#b5c4ff]">Alojamiento completo</span>
                <h3 className="text-[20px] font-semibold leading-tight">Yeso</h3>
                <div className="mt-1 flex items-center gap-1 text-[#c3c5d8]">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="text-[15px] font-medium">4.96</span>
                  <span className="text-[14px] text-[#8d90a1]">(124 reseñas)</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#353534] pt-6 text-[14px]">
              <h4 className="mb-1 text-[20px] font-semibold">Detalle de precio</h4>
              <div className="flex justify-between"><span className="text-[#c3c5d8]">ARS 155.000 x 4 noches</span><span>ARS 620.000</span></div>
              <div className="flex justify-between"><span className="cursor-help text-[#c3c5d8] underline decoration-dotted underline-offset-4">Comisión Pedri</span><span>ARS 186.000</span></div>
              <div className="flex justify-between"><span className="cursor-help text-[#c3c5d8] underline decoration-dotted underline-offset-4">Monto propietario</span><span>ARS 434.000</span></div>
              <div className="flex justify-between"><span className="text-[#c3c5d8]">Huéspedes</span><span>2</span></div>
            </div>

            <div className="mt-2 flex items-end justify-between border-t border-[#353534] pt-6">
              <span className="text-[20px] font-semibold">Total (ARS)</span>
              <span className="text-[32px] font-bold tracking-tight text-[#e5e2e1]">ARS 620.000</span>
            </div>

            <TrackedButton eventName="confirmar_pagar_click" location="finalizar_cta" className="flex w-full items-center justify-center gap-1 rounded bg-[#2d68ff] py-[14px] text-[20px] font-semibold text-[#fffcff] shadow-[0_4px_20px_rgba(45,104,255,0.3)] transition-colors hover:bg-[#0050e3]">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>lock</span>
              Confirmar y pagar
            </TrackedButton>
            <p className="mt-1 text-center text-[14px] text-[#8d90a1]">No se realizará ningún cobro hasta confirmar.</p>
          </div>
        </div>
      </main>

      <footer className="mt-auto w-full border-t border-[#434655] bg-[#0e0e0e]">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">
          <span className="text-[12px] font-semibold uppercase tracking-widest text-[#b5c4ff]">© 2026 Pedri. Todos los derechos reservados.</span>
          <nav className="flex gap-6">
            <a className="text-[14px] text-[#c3c5d8] opacity-80 transition hover:text-[#e5e2e1] hover:opacity-100" href="#">Explorar</a>
            <a className="text-[14px] text-[#c3c5d8] opacity-80 transition hover:text-[#e5e2e1] hover:opacity-100" href="#">Cómo funciona</a>
            <a className="text-[14px] text-[#c3c5d8] opacity-80 transition hover:text-[#e5e2e1] hover:opacity-100" href="#">Soporte</a>
            <a className="text-[14px] text-[#c3c5d8] opacity-80 transition hover:text-[#e5e2e1] hover:opacity-100" href="#">Privacidad</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

