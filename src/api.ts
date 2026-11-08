export type Params = Record<string, number | string | undefined>

/** Build a Simple Ethernet API message: >C:1,SC:2# */
export function buildMessage(command: number, params: Params = {}): string {
	const parts = [`C:${command}`]
	for (const [k, v] of Object.entries(params)) {
		if (v !== undefined && v !== '') parts.push(`${k}:${v}`)
	}
	return `>${parts.join(',')}#`
}

/** Parse a reply such as "?C:101, SC:3, A:1#" into key/value pairs (values as numbers where possible). */
export function parseMessage(msg: string): Record<string, number> | null {
	const m = msg.match(/[>?]([^#]*)#/)
	if (!m) return null
	const out: Record<string, number> = {}
	for (const pair of m[1].split(',')) {
		const [k, v] = pair.split(':')
		if (!k || !v?.trim()) continue
		const n = Number(v)
		if (!Number.isNaN(n)) out[k.trim().toUpperCase()] = n
	}
	return 'C' in out ? out : null
}
