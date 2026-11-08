import type ModuleInstance from './main.js'

export type FeedbacksSchema = {
	scene_active: { type: 'boolean'; options: { scene: number } }
	space_off: { type: 'boolean'; options: { space: number } }
	tag_active: { type: 'boolean'; options: { tagSet: number; tag: number } }
}

const num = <K extends string>(id: K, label: string) =>
	({ id, type: 'number', label, default: 1, min: 1, max: 65535 }) as const
const style = { bgcolor: 0x00aa00, color: 0xffffff }

export function UpdateFeedbacks(self: ModuleInstance): void {
	self.setFeedbackDefinitions({
		scene_active: {
			name: 'Scene is active',
			type: 'boolean',
			defaultStyle: style,
			options: [num('scene', 'Scene')],
			callback: (f) => {
				self.watch(f.id, 101, { SC: f.options.scene })
				return self.state.get(`101:SC${f.options.scene}`) === 1
			},
			unsubscribe: (f) => self.unwatch(f.id),
		},
		space_off: {
			name: 'Space is off',
			type: 'boolean',
			defaultStyle: style,
			options: [num('space', 'Space')],
			callback: (f) => {
				self.watch(f.id, 102, { S: f.options.space })
				return self.state.get(`102:S${f.options.space}`) === 1
			},
			unsubscribe: (f) => self.unwatch(f.id),
		},
		tag_active: {
			name: 'Tag is active',
			type: 'boolean',
			defaultStyle: style,
			options: [num('tagSet', 'Tag set'), num('tag', 'Tag')],
			callback: (f) => {
				self.watch(f.id, 105, { TS: f.options.tagSet, TG: f.options.tag })
				return self.state.get(`105:TS${f.options.tagSet}:TG${f.options.tag}`) === 1
			},
			unsubscribe: (f) => self.unwatch(f.id),
		},
	})
}
