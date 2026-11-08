import type ModuleInstance from './main.js'
import { parseSpaces } from './config.js'

export type VariablesSchema = Record<string, number>

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	const defs: Record<string, { name: string }> = {}
	for (const n of parseSpaces(self.config.spaces ?? '')) {
		defs[`space_${n}_intensity`] = { name: `Space ${n} master intensity (0-255)` }
		defs[`space_${n}_intensity_pct`] = { name: `Space ${n} master intensity (%)` }
	}
	self.setVariableDefinitions(defs)
}
