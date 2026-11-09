// ============================================================
// LEER TODAS LAS FILAS DE UNA CONSULTA
// ============================================================
//
// Supabase devuelve como máximo 1000 filas por consulta.
// Con el pack B2 una cuenta puede tener más de 1000 palabras
// y más de 2000 traducciones, así que leemos por páginas.
//
// Uso:
//   const words = await fetchAll<Word>((from, to) =>
//     supabase.from("words").select("id, english")
//       .eq("user_id", user.id).order("id").range(from, to)
//   );
// ============================================================

const PAGE_SIZE = 1000;
const PARALLEL_PAGES = 3;

type PageResult<T> = PromiseLike<{
  data: T[] | null;
  error: { message: string } | null;
}>;

export async function fetchAll<T>(
  buildQuery: (from: number, to: number) => PageResult<T>
): Promise<T[]> {
  const rows: T[] = [];

  // Pedimos varias páginas a la vez (en paralelo) en lugar de
  // una detrás de otra: con 2.000-3.000 filas todo llega en
  // un solo "viaje" a Supabase.
  for (let start = 0; ; start += PAGE_SIZE * PARALLEL_PAGES) {
    const pages = await Promise.all(
      Array.from({ length: PARALLEL_PAGES }, (_, i) => {
        const from = start + i * PAGE_SIZE;
        return buildQuery(from, from + PAGE_SIZE - 1);
      })
    );

    for (const { data, error } of pages) {
      if (error) {
        throw new Error(error.message);
      }

      const page = data ?? [];
      rows.push(...page);

      if (page.length < PAGE_SIZE) {
        return rows;
      }
    }
  }
}

export function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }

  return chunks;
}
