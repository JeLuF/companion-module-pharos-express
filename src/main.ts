import { InstanceBase, InstanceStatus, UDPHelper, type SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, parseSpaces, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions, type VariablesSchema } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions, type ActionsSchema } from './actions.js'
import { UpdateFeedbacks, type FeedbacksSchema } from './feedbacks.js'
import { UpdatePresets } from './presets.js'
import { buildMessage, parseMessage, type Params } from './api.js'

export type ModuleSchema = {
	config: ModuleConfig
	secrets: undefined
	actions: ActionsSchema
	feedbacks: FeedbacksSchema
	variables: VariablesSchema
}

export { UpgradeScripts }

export default class ModuleInstance extends InstanceBase<ModuleSchema> {
	config!: ModuleConfig // Setup in init()

	constructor(internal: unknown) {
		super(internal)
	}

	/** Latest query results, keyed e.g. "101:SC3" */
	state = new Map<string, number>()
	private udp?: UDPHelper
	private poll?: NodeJS.Timeout

	async init(config: ModuleConfig): Promise<void> {
		this.config = config
		this.updateActions()
		this.updateFeedbacks()
		this.updatePresets()
		this.updateVariableDefinitions()
		this.start()
	}

	async destroy(): Promise<void> {
		this.stop()
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config
		this.stop()
		this.updateActions()
		this.updatePresets()
		this.updateVariableDefinitions()
		this.start()
	}

	private start(): void {
		if (!this.config.host || !this.config.port) {
			this.updateStatus(InstanceStatus.BadConfig, 'Host and port required')
			return
		}
		// Express sends replies to the fixed feedback IP/port configured in Express (not to the
		// sender), so when feedback is on we bind our socket to that port to receive them.
		const udp = new UDPHelper(
			this.config.host,
			this.config.port,
			this.config.feedback ? { bind_port: this.config.feedbackPort } : undefined,
		)
		this.udp = udp
		udp.on('error', (e) => this.log('error', `UDP error: ${e.message}`))
		udp.on('status_change', (status, message) => this.updateStatus(status, message))
		udp.on('data', (m) => this.handleResponse(m.toString()))
		this.updateStatus(InstanceStatus.Ok)

		if (this.config.feedback) {
			this.poll = setInterval(() => this.runPoll(), this.config.pollInterval)
			this.runPoll()
		}
	}

	private stop(): void {
		clearInterval(this.poll)
		this.poll = undefined
		this.udp?.destroy()
		this.udp = undefined
		this.state.clear()
	}

	getMaster(space: number): number | undefined {
		return this.state.get(`103:S${space}`)
	}

	/** Send a master intensity command and remember the value (confirmed by the next poll). */
	setMaster(space: number, intensity: number, fade: number): void {
		this.send(3, { S: space, I: intensity, F: fade })
		this.storeMaster(space, intensity)
	}

	private storeMaster(space: number, intensity: number): void {
		this.state.set(`103:S${space}`, intensity)
		if (parseSpaces(this.config.spaces ?? '').includes(space)) {
			this.setVariableValues({
				[`space_${space}_intensity`]: intensity,
				[`space_${space}_intensity_pct`]: Math.round((intensity / 255) * 100),
			})
		}
	}

	send(command: number, params: Params = {}): void {
		const msg = buildMessage(command, params)
		this.log('debug', `TX ${msg}`)
		this.udp?.send(msg)
	}

	private watched = new Map<string, { command: number; params: Params }>()

	watch(id: string, command: number, params: Params): void {
		this.watched.set(id, { command, params })
	}

	unwatch(id: string): void {
		this.watched.delete(id)
	}

	/** Query only what active feedbacks need. */
	private runPoll(): void {
		for (const w of this.watched.values()) this.send(w.command, w.params)
		for (const n of parseSpaces(this.config.spaces ?? '')) this.send(103, { S: n })
	}

	private handleResponse(raw: string): void {
		this.log('debug', `RX ${raw}`)
		const err = raw.match(/!E=(\d+)#/)
		if (err) {
			this.log(
				'warn',
				err[1] === '1' ? 'Express: command format error (E=1)' : 'Express: data error, item not found (E=2)',
			)
			return
		}
		const r = parseMessage(raw)
		if (!r) return
		let key: string | undefined
		let val: number | undefined
		switch (r.C) {
			case 101:
				key = `101:SC${r.SC}`
				val = r.A
				break
			case 102:
				key = `102:S${r.S}`
				val = r.O
				break
			case 103:
				if (r.S !== undefined && r.I !== undefined) this.storeMaster(r.S, r.I)
				return
			case 105:
				key = `105:TS${r.TS}:TG${r.TG}`
				val = r.A
				break
		}
		if (key === undefined || val === undefined) return
		if (this.state.get(key) !== val) {
			this.state.set(key, val)
			this.checkFeedbacks('scene_active', 'space_off', 'tag_active')
		}
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updatePresets(): void {
		UpdatePresets(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}
}
