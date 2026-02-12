class AudioState {
	currentTrack = $state('');
	volume = $state(0.4);
	isMuted = $state(false);
	element = $state<HTMLAudioElement>();
	activeDucks = 0;

	setTrack(track: string) {
		if (this.currentTrack !== track) {
			this.currentTrack = track;
		}
	}

	setVolume(vol: number) {
		this.volume = vol;
		this.updateElementVolume();
	}

	private updateElementVolume() {
		if (this.element) {
			const multiplier = this.activeDucks > 0 ? 0.2 : 1;
			this.element.volume = this.volume * multiplier;
		}
	}

	duck() {
		this.activeDucks++;
		this.updateElementVolume();
	}

	unduck() {
		if (this.activeDucks > 0) this.activeDucks--;
		this.updateElementVolume();
	}

	toggleMute() {
		this.isMuted = !this.isMuted;
		if (this.element) this.element.muted = this.isMuted;
	}

	setElement(el: HTMLAudioElement) {
		this.element = el;
		this.updateElementVolume();
		this.element.muted = this.isMuted;
	}
}

export const audioState = new AudioState();
