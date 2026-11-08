import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export type ModuleConfig = {
	host: string
	port: number
	feedback: boolean
	feedbackPort: number
	pollInterval: number
	spaces: string
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Express Control IP',
			width: 8,
			regex: Regex.IP,
		},
		{
			type: 'number',
			id: 'port',
			label: 'UDP port (Express listens on)',
			width: 4,
			min: 1024,
			max: 65535,
			default: 1025,
		},
		{
			type: 'checkbox',
			id: 'feedback',
			label: 'Enable feedback (queries)',
			description:
				'Express sends replies to a fixed IP/port, not to the sender. In Express "Configure Simple Ethernet API", enable "Send feedback data" and set the feedback IP to this computer and the feedback port to the port below.',
			width: 4,
			default: false,
		},
		{
			type: 'number',
			id: 'feedbackPort',
			label: 'Local UDP port for feedback',
			width: 4,
			min: 1024,
			max: 65535,
			default: 1025,
			isVisibleExpression: '$(options:feedback)',
		},
		{
			type: 'number',
			id: 'pollInterval',
			label: 'Poll interval (ms)',
			width: 4,
			min: 250,
			max: 60000,
			default: 1000,
			isVisibleExpression: '$(options:feedback)',
		},
		{
			type: 'textinput',
			id: 'spaces',
			label: 'Spaces to monitor',
			description:
				'Spaces whose master intensity is polled into variables, e.g. "1,2,5-8". Used by "Change master intensity".',
			width: 12,
			default: '',
			isVisibleExpression: '$(options:feedback)',
		},
	]
}

/** Parse "1,2,5-8" into [1,2,5,6,7,8] */
export function parseSpaces(text: string): number[] {
	const out = new Set<number>()
	for (const part of text.split(',')) {
		const m = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/)
		if (!m) continue
		const a = Number(m[1])
		const b = m[2] ? Number(m[2]) : a
		for (let n = Math.min(a, b); n <= Math.max(a, b) && n - a < 1000; n++) out.add(n)
	}
	return [...out].sort((x, y) => x - y)
}
