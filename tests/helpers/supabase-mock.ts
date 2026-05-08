/**
 * Mock chainable de Supabase Client.
 *
 * Filosofía: NO testeamos Supabase, testeamos nuestras routes. El mock NO
 * filtra ni evalúa cláusulas — solo registra qué se llamó y devuelve la
 * respuesta scripteada por test.
 *
 * Uso:
 *   const sb = createSupabaseMock()
 *   sb.scriptResponse('products', 'select', { data: [productRow] })
 *   sb.scriptResponse('orders', 'insert', { error: null })
 *
 *   // Después del test:
 *   expect(sb.calls('products', 'select')).toHaveLength(1)
 *   expect(sb.callsFor('orders', 'insert')[0].payload).toMatchObject({...})
 */

export type Op = 'select' | 'insert' | 'update' | 'upsert' | 'delete' | 'rpc'

export interface ScriptedResponse {
  data?: unknown
  error?: { message: string } | null
}

export interface CallRecord {
  op: Op
  /** Filtros aplicados (.eq/.in/.ilike/etc), en orden */
  filters: Array<{ method: string; args: unknown[] }>
  /** Payload pasado a insert/update/upsert */
  payload?: unknown
  /** Columnas pasadas a .select(cols) */
  columns?: string
  /** Si llamó .single() o .maybeSingle() */
  terminator: 'single' | 'maybeSingle' | 'thenable'
  /** onConflict de upsert si lo hubo */
  onConflict?: string
}

interface ScriptKey { table: string; op: Op }
interface ScriptEntry extends ScriptKey {
  responses: ScriptedResponse[]
  /** Si true, devuelve siempre la última respuesta tras agotar la queue */
  sticky: boolean
}

export interface SupabaseMock {
  /** Cliente compatible con la interfaz que usan las routes */
  client: SupabaseClientLike
  /** Pre-configura qué devuelve la próxima llamada a (table, op) */
  scriptResponse(table: string, op: Op, response: ScriptedResponse, opts?: { sticky?: boolean }): void
  /** Llamadas registradas para una tabla + op */
  callsFor(table: string, op: Op): CallRecord[]
  /** Total de llamadas a una tabla (cualquier op) */
  callsToTable(table: string): CallRecord[]
}

// ─── Interfaces parciales del client real ──────────────────────────────────
// No necesitamos cobertura completa del SDK, solo lo que usan las routes.

type ChainResolver = Promise<ScriptedResponse> & ChainBuilder

interface ChainBuilder {
  select(cols?: string): ChainBuilder
  eq(col: string, val: unknown): ChainBuilder
  neq(col: string, val: unknown): ChainBuilder
  in(col: string, vals: unknown[]): ChainBuilder
  ilike(col: string, val: unknown): ChainBuilder
  contains(col: string, val: unknown): ChainBuilder
  range(from: number, to: number): ChainBuilder
  order(col: string, opts?: unknown): ChainBuilder
  limit(n: number): ChainBuilder
  single(): Promise<ScriptedResponse>
  maybeSingle(): Promise<ScriptedResponse>
}

export interface SupabaseClientLike {
  from(table: string): {
    select(cols?: string): ChainBuilder
    insert(payload: unknown): ChainBuilder
    update(payload: unknown): ChainBuilder
    upsert(payload: unknown, opts?: { onConflict?: string }): ChainBuilder
    delete(): ChainBuilder
  }
  /**
   * RPC (Stored Procedures). Para webhook MP usamos
   * `decrement_variant_stock(variant_id, qty)`. Resuelve directo, sin chain.
   * Script con scriptResponse(rpcName, 'rpc', response).
   */
  rpc(name: string, args?: Record<string, unknown>): Promise<ScriptedResponse>
}

export function createSupabaseMock(): SupabaseMock {
  const scripts = new Map<string, ScriptEntry>()
  const calls: CallRecord[] = []

  const key = (t: string, o: Op) => `${t}::${o}`

  function nextResponse(table: string, op: Op): ScriptedResponse {
    const entry = scripts.get(key(table, op))
    if (!entry || entry.responses.length === 0) {
      throw new Error(
        `[supabase-mock] Sin respuesta scripteada para ${table}.${op}(). ` +
        `Llamá a scriptResponse('${table}', '${op}', ...) antes del test.`,
      )
    }
    if (entry.sticky && entry.responses.length === 1) return entry.responses[0]
    return entry.responses.shift()!
  }

  function buildChain(table: string, op: Op, record: CallRecord): ChainResolver {
    const recordCall = (method: string, args: unknown[]) => {
      record.filters.push({ method, args })
    }

    const finalize = async (terminator: CallRecord['terminator']): Promise<ScriptedResponse> => {
      record.terminator = terminator
      calls.push(record)
      return nextResponse(table, op)
    }

    // Proxy thenable: el chain se puede await directo (sin .single()) y eso
    // imita el comportamiento real de Supabase (devuelve { data, error } con
    // data como array para queries no-terminadas).
    const builder: ChainBuilder & { then?: unknown } = {
      select(cols) { record.columns = cols; recordCall('select', [cols]); return builder },
      eq(c, v)     { recordCall('eq', [c, v]); return builder },
      neq(c, v)    { recordCall('neq', [c, v]); return builder },
      in(c, v)     { recordCall('in', [c, v]); return builder },
      ilike(c, v)  { recordCall('ilike', [c, v]); return builder },
      contains(c,v){ recordCall('contains', [c, v]); return builder },
      range(f, t)  { recordCall('range', [f, t]); return builder },
      order(c, o)  { recordCall('order', [c, o]); return builder },
      limit(n)     { recordCall('limit', [n]); return builder },
      single()        { return finalize('single') },
      maybeSingle()   { return finalize('maybeSingle') },
    }

    // thenable: await chain → resuelve con la respuesta scripteada
    Object.defineProperty(builder, 'then', {
      value: (resolve: (v: ScriptedResponse) => void, reject: (e: unknown) => void) => {
        finalize('thenable').then(resolve, reject)
      },
      enumerable: false,
    })

    return builder as ChainResolver
  }

  type RecordWithTable = CallRecord & { _table: string }

  const client: SupabaseClientLike = {
    from(table: string) {
      return {
        select(cols?: string) {
          const record: RecordWithTable = { _table: table, op: 'select', filters: [], columns: cols, terminator: 'thenable' }
          return buildChain(table, 'select', record)
        },
        insert(payload: unknown) {
          const record: RecordWithTable = { _table: table, op: 'insert', filters: [], payload, terminator: 'thenable' }
          return buildChain(table, 'insert', record)
        },
        update(payload: unknown) {
          const record: RecordWithTable = { _table: table, op: 'update', filters: [], payload, terminator: 'thenable' }
          return buildChain(table, 'update', record)
        },
        upsert(payload: unknown, opts?: { onConflict?: string }) {
          const record: RecordWithTable = { _table: table, op: 'upsert', filters: [], payload, terminator: 'thenable', onConflict: opts?.onConflict }
          return buildChain(table, 'upsert', record)
        },
        delete() {
          const record: RecordWithTable = { _table: table, op: 'delete', filters: [], terminator: 'thenable' }
          return buildChain(table, 'delete', record)
        },
      }
    },
    async rpc(name: string, args?: Record<string, unknown>) {
      const record: RecordWithTable = {
        _table: name, op: 'rpc', filters: [], payload: args, terminator: 'thenable',
      }
      calls.push(record)
      return nextResponse(name, 'rpc')
    },
  }

  return {
    client,
    scriptResponse(table, op, response, opts) {
      const k = key(table, op)
      const existing = scripts.get(k)
      if (existing) {
        existing.responses.push(response)
        if (opts?.sticky) existing.sticky = true
      } else {
        scripts.set(k, { table, op, responses: [response], sticky: opts?.sticky ?? false })
      }
    },
    callsFor(table, op) {
      return calls.filter(c => c.op === op && (c as RecordWithTable)._table === table)
    },
    callsToTable(table) {
      return calls.filter(c => (c as RecordWithTable)._table === table)
    },
  }
}
