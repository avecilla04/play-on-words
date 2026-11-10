// Se muestra al instante mientras carga cualquier pantalla
// de /protected, para que la app no parezca bloqueada.

export default function Loading() {
  return (
    <main className="app-shell">
      <div className="mx-auto w-full max-w-md animate-pulse">
        <div className="mb-6 h-5 w-20 rounded-full bg-slate-200" />

        <div className="mb-6 h-9 w-48 rounded-xl bg-slate-200" />

        <div className="h-44 rounded-3xl bg-slate-200" />

        <div className="mt-4 space-y-3">
          <div className="h-20 rounded-2xl bg-slate-100" />
          <div className="h-20 rounded-2xl bg-slate-100" />
          <div className="h-20 rounded-2xl bg-slate-100" />
        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
          Cargando…
        </p>
      </div>
    </main>
  );
}
