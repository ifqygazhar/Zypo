class AudioState {
	currentTrack = $state('');
	volume = $state(0.4);
	isMuted = $state(false);
	element = $state<HTMLAudioElement>();

	setTrack(track: string) {
		if (this.currentTrack !== track) {
			this.currentTrack = track;
		}
	}

	setVolume(vol: number) {
		this.volume = vol;
		if (this.element) this.element.volume = vol;
	}

	toggleMute() {
		this.isMuted = !this.isMuted;
		if (this.element) this.element.muted = this.isMuted;
	}

	setElement(el: HTMLAudioElement) {
		this.element = el;
		this.element.volume = this.volume;
		this.element.muted = this.isMuted;
	}
}

export const audioState = new AudioState();
