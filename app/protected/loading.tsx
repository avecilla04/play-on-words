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
          Cargando…
        </p>
      </div>
    </main>
  );
}
