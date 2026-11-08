import type ModuleInstance from './main.js'

export type ActionsSchema = {
	scene: { options: { scene: number } }
	scene_in_space: { options: { space: number; scene: number } }
	space_off: { options: { space: number } }
	master: { options: { space: number; intensity: number; fade: number } }
	master_step: { options: { space: number; step: number; fade: number } }
	override: {
		options: {
			target: 'S' | 'GR'
			space: number
			intensity: number
			temperature: number
			red: number
			green: number
			blue: number
			fade: number
		}
	}
	tag: { options: { tagSet: number; tag: number } }
}

const space = { id: 'space', type: 'number', label: 'Space', default: 1, min: 1, max: 65535 } as const
const fade = {
	id: 'fade',
	type: 'number',
	label: 'Fade (centiseconds)',
	default: 0,
	min: 0,
	max: 65535,
} as const
const byte = <K extends string>(id: K, label: string, def: number) =>
	({ id, type: 'number', label, default: def, min: 0, max: 255 }) as const

export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		scene: {
			name: 'Activate scene',
			options: [{ id: 'scene', type: 'number', label: 'Scene (absolute)', default: 1, min: 1, max: 65535 }],
			callback: async (e) => self.send(1, { SC: e.options.scene }),
		},
		scene_in_space: {
			name: 'Activate scene in space',
			options: [
				space,
				{ id: 'scene', type: 'number', label: 'Scene (index within space)', default: 1, min: 1, max: 65535 },
			],
			callback: async (e) => self.send(6, { SR: e.options.scene, S: e.options.space }),
		},
		space_off: {
			name: 'Space off',
			options: [space],
			callback: async (e) => self.send(2, { S: e.options.space }),
		},
		master: {
			name: 'Set space master intensity',
			options: [space, byte('intensity', 'Intensity (0-255)', 255), fade],
			callback: async (e) => self.setMaster(e.options.space, e.options.intensity, e.options.fade),
		},
		master_step: {
			name: 'Change master intensity',
			description:
				'Raises or lowers a space master by a percentage of full scale, starting from the last known value. Add the space under "Spaces to monitor" (feedback must be on) so the value is polled; otherwise the starting point is the last value set by this module.',
			options: [
				space,
				{ id: 'step', type: 'number', label: 'Step (% of full, negative to lower)', default: 10, min: -100, max: 100 },
				fade,
			],
			callback: async (e) => {
				const cur = self.getMaster(e.options.space)
				if (cur === undefined) {
					self.log('warn', `Master intensity of space ${e.options.space} unknown; monitor it or set it first`)
					return
				}
				const next = Math.max(0, Math.min(255, Math.round(cur + (e.options.step / 100) * 255)))
				self.setMaster(e.options.space, next, e.options.fade)
			},
		},
		override: {
			name: 'Space override',
			description: 'Express default fade for overrides is 2 seconds.',
			options: [
				{
					id: 'target',
					type: 'dropdown',
					label: 'Target type',
					choices: [
						{ id: 'S', label: 'Space' },
						{ id: 'GR', label: 'Group' },
					],
					default: 'S',
				},
				{ ...space, label: 'Space / group number' },
				byte('intensity', 'Intensity (0-255)', 255),
				byte('temperature', 'Colour temperature (0 cool - 255 warm)', 128),
				byte('red', 'Red', 255),
				byte('green', 'Green', 255),
				byte('blue', 'Blue', 255),
				{ ...fade, default: 200 },
			],
			callback: async (e) =>
				self.send(4, {
					[e.options.target]: e.options.space,
					I: e.options.intensity,
					T: e.options.temperature,
					R: e.options.red,
					G: e.options.green,
					B: e.options.blue,
					F: e.options.fade,
				}),
		},
		tag: {
			name: 'Activate tag',
			options: [
				{ id: 'tagSet', type: 'number', label: 'Tag set', default: 1, min: 1, max: 65535 },
				{ id: 'tag', type: 'number', label: 'Tag', default: 1, min: 1, max: 65535 },
			],
			callback: async (e) => self.send(5, { TS: e.options.tagSet, TG: e.options.tag }),
		},
	})
}
