<template>
	<v-app>
		<v-main>
			<v-container v-if="!settings.autoLoad" style="margin-top: 100px">
				<v-card>
					<!-- eslint-disable-next-line no-irregular-whitespace -->
					<v-card-title>Settings​</v-card-title>
					<v-card-text>
						<v-form
							ref="form"
							v-model="valid"
							@submit.prevent="updateSettings"
						>
							<v-row>
								<v-col :cols="12" :sm="6">
									<v-text-field
										v-model="settings.url"
										label="URL"
										hint="URL to load"
										:rules="[validUrl]"
										required
									></v-text-field>
								</v-col>
								<v-col
									:cols="12"
									:sm="6"
									v-if="settings.autoReloadMode === 'every'"
								>
									<v-text-field
										:disabled="!settings.autoReload"
										v-model="settings.autoReloadEvery"
										label="Every"
										hint="Reload page every if no activity (string duration). Ex: 30s"
										persistent-hint
										clearable
										:rules="[validateDuration]"
										required
									></v-text-field>
								</v-col>
							</v-row>
						</v-form>
					</v-card-text>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn
							variant="text"
							:disabled="!valid"
							color="primary"
							@click="updateSettings"
						>
							🚀 Start
						</v-btn>
					</v-card-actions>
				</v-card>
			</v-container>
			<v-col v-else align="center">
				<div class="text-center">
					<atom-loader :modelValue="true" />
				</div>
			</v-col>
			<v-snackbar
				v-model="snackbar.show"
				location="top"
				:color="snackbar.color"
				timeout="2000"
			>
				{{ snackbar.text }}
				<template v-slot:action="{ attrs }">
					<v-btn
						variant="text"
						v-bind="attrs"
						@click="snackbar.show = false"
					>
						Close
					</v-btn>
				</template>
			</v-snackbar>
		</v-main>
	</v-app>
</template>

<script>
import parse from 'parse-duration'
import AtomLoader from './components/AtomLoader.vue'

export default {
	components: { AtomLoader },
	data: () => ({
		settings: { autoReloadMode: 'every' },
		valid: true,
		snackbar: {
			show: false,
			text: null,
			color: 'info'
		},
		hours: new Array(24).fill(0).map((v, i) => ({
			title: `${i < 10 ? '0' : ''}${i}:00`,
			value: i
		}))
	}),
	computed: {
		store() {
			return window.store
		}
	},
	mounted() {
		window.ipc.on('action', action => {
			let text = ''
			const color = 'success'

			switch (action) {
				case 'clearCache':
					text = 'Cache cleared!'
					break
				case 'clearStorage':
					text = 'Storage cleared!'
					break
				default:
					text = `Unknown action ${action}`
					break
			}

			this.snackbar = {
				show: true,
				text,
				color
			}
		})

		this.settings = this.store.settings()

		if (this.settings.autoLoad) {
			this.checkUrl()
		}
	},
	methods: {
		parse,
		updateSettings() {
			if (this.$refs.form.validate()) {
				this.settings.autoLoad = true
				this.store.setSettings({ ...this.settings })
				this.checkUrl()
			}
		},
		validUrl(url) {
			try {
				const parsed = new URL(url)
				return (
					parsed.protocol === 'http:' ||
					parsed.protocol === 'https:' ||
					'Invalid URL'
				)
			} catch (e) {
				return 'Invalid URL'
			}
		},
		async checkUrl() {
			try {
				// check if url is reachable
				await fetch(this.settings.url, {
					method: 'HEAD'
				})

				this.urlReady = true
				// redirect to url
				window.location.href = this.settings.url
			} catch (error) {
				// noop
			}

			if (!this.urlReady) {
				setTimeout(() => {
					this.checkUrl()
				}, 2000)
			}
		},
		async sendAction(action) {
			window.ipc.send('action', action)
		},
		isNumber(value, coerce = false) {
			if (coerce) {
				value = Number(value)
			}
			return typeof value === 'number' && Number.isFinite(value)
		},
		validateDuration(v) {
			const parsed = parse(v)
			return this.isNumber(parsed) || 'Invalid duration'
		}
	},
	watch: {
		settings: {
			handler(val) {
				this.$vuetify.theme.global.name = val.dark ? 'dark' : 'light'
			},
			deep: true
		}
	}
}
</script>
