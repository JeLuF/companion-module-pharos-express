import type { ModuleSchema } from './main.js'
import type ModuleInstance from './main.js'
import type { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'

export function UpdatePresets(self: ModuleInstance): void {
	const structure: CompanionPresetSection[] = [
		{
			id: 'scenes',
			name: 'Scenes',
			definitions: [
				{
					id: 'scenes_group',
					name: 'Scenes',
					type: 'simple',
					presets: ['scene_1', 'space_off_1'],
				},
			],
		},
		{
			id: 'intensity',
			name: 'Master intensity',
			definitions: [
				{
					id: 'intensity_group',
					name: 'Space 1 master',
					description: 'Add space 1 to "Spaces to monitor" in the config so the value is polled.',
					type: 'simple',
					presets: ['master_up_1', 'master_down_1'],
				},
			],
		},
	]

	const presets: CompanionPresetDefinitions<ModuleSchema> = {
		scene_1: {
			type: 'simple',
			name: 'Activate scene 1',
			style: { text: 'Scene 1', size: 'auto', color: 0xffffff, bgcolor: 0x000000 },
			steps: [{ down: [{ actionId: 'scene', options: { scene: 1 } }], up: [] }],
			feedbacks: [{ feedbackId: 'scene_active', options: { scene: 1 }, style: { bgcolor: 0x00aa00 } }],
		},
		space_off_1: {
			type: 'simple',
			name: 'Space 1 off',
			style: { text: 'Space 1\\nOFF', size: 'auto', color: 0xffffff, bgcolor: 0x000000 },
			steps: [{ down: [{ actionId: 'space_off', options: { space: 1 } }], up: [] }],
			feedbacks: [{ feedbackId: 'space_off', options: { space: 1 }, style: { bgcolor: 0xaa0000 } }],
		},
		master_up_1: {
			type: 'simple',
			name: 'Space 1 master +10%',
			style: {
				text: `Space 1\\n+10%\\n$(${self.label}:space_1_intensity_pct)%`,
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			steps: [{ down: [{ actionId: 'master_step', options: { space: 1, step: 10, fade: 25 } }], up: [] }],
			feedbacks: [],
		},
		master_down_1: {
			type: 'simple',
			name: 'Space 1 master -10%',
			style: {
				text: `Space 1\\n-10%\\n$(${self.label}:space_1_intensity_pct)%`,
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			steps: [{ down: [{ actionId: 'master_step', options: { space: 1, step: -10, fade: 25 } }], up: [] }],
			feedbacks: [],
		},
	}

	self.setPresetDefinitions(structure, presets)
}
