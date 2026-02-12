<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../../../convex/_generated/api';
	import { convex } from '$lib/convex.svelte';

	interface Props {
		customQuestions: any;
	}

	let { customQuestions = $bindable() }: Props = $props();

	let questionSourceMode = $state<'upload' | 'library'>('upload');
	let searchQuery = $state('');
	let isSaving = $state(false);
	let questionFileInput = $state<HTMLInputElement | null>(null);
	let customQuestionsMetadata = $state<{
		title: string;
		author: string;
		language: string;
		count: number;
	} | null>(null);

	const publicQuestions = useQuery(api.questions.search, () => ({
		query: searchQuery
	}));

	function downloadTemplate() {
		const template = {
			title: 'My Custom Quiz',
			author: 'Agent Zero',
			language: 'English',
			questions: [
				{
					text: 'Example Question?',
					code: 'console.log("Hello")',
					options: ['Option A', 'Option B', 'Option C', 'Option D'],
					correct: 0
				}
			]
		};
		const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'questions_template.json';
		a.click();
		URL.revokeObjectURL(url);
	}

	async function handleQuestionUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		try {
			const text = await file.text();
			const json = JSON.parse(text);

			if (!json.questions || !Array.isArray(json.questions)) {
				throw new Error('Invalid JSON format: missing "questions" array');
			}

			customQuestions = json.questions;
			customQuestionsMetadata = {
				title: json.title || 'Unknown Title',
				author: json.author || 'Unknown Author',
				language: json.language || 'Unknown',
				count: json.questions.length
			};
		} catch (err) {
			console.error('JSON Error:', err);
			alert('Failed to parse JSON: ' + (err as Error).message);
			customQuestions = null;
			customQuestionsMetadata = null;
		} finally {
			target.value = '';
		}
	}

	async function handleSaveToLibrary() {
		if (!customQuestions || !customQuestionsMetadata) return;

		isSaving = true;
		try {
			await convex.mutation(api.questions.create, {
				title: customQuestionsMetadata.title,
				author: customQuestionsMetadata.author,
				language: customQuestionsMetadata.language,
				questions: customQuestions,
				isPublic: true
			});
			alert('Saved to Library!');
		} catch (e) {
			console.error(e);
			alert('Failed to save to library');
		} finally {
			isSaving = false;
		}
	}
</script>

<div class="space-y-3 pb-6 border-b border-neutral-800 mb-6">
	<span class="text-[10px] font-bold uppercase text-neutral-600 tracking-widest"
		>Mission Intel (Optional)</span
	>
	<div class="bg-neutral-900/50 p-3 rounded-xl border border-neutral-800">
		<div class="flex justify-between items-center mb-2">
			<span class="text-xs text-neutral-400">Custom Questions</span>
			<button
				onclick={downloadTemplate}
				class="text-[10px] text-orange-500 hover:text-orange-400 underline font-mono"
			>
				Download Template
			</button>
		</div>

		<!-- TABS FOR QUESTION SOURCE -->
		<div class="flex gap-2 mb-3">
			<button
				class="flex-1 py-1 text-[10px] font-bold uppercase rounded transition-colors {questionSourceMode ===
				'upload'
					? 'bg-orange-500 text-black'
					: 'bg-neutral-800 text-neutral-500 hover:text-neutral-300'}"
				onclick={() => (questionSourceMode = 'upload')}
			>
				Upload File
			</button>
			<button
				class="flex-1 py-1 text-[10px] font-bold uppercase rounded transition-colors {questionSourceMode ===
				'library'
					? 'bg-orange-500 text-black'
					: 'bg-neutral-800 text-neutral-500 hover:text-neutral-300'}"
				onclick={() => (questionSourceMode = 'library')}
			>
				Library
			</button>
		</div>

		{#if questionSourceMode === 'upload'}
			{#if customQuestionsMetadata}
				<div class="bg-black/40 p-2 rounded mb-2 border border-orange-500/30">
					<div class="text-xs font-bold text-white">{customQuestionsMetadata.title}</div>
					<div class="text-[10px] text-neutral-500 flex justify-between">
						<span>By: {customQuestionsMetadata.author}</span>
						<span>Lang: {customQuestionsMetadata.language}</span>
					</div>
					<div class="text-[10px] text-orange-400 mt-1">
						{customQuestionsMetadata.count} questions loaded
					</div>
				</div>

				<div class="flex gap-2">
					<button
						onclick={handleSaveToLibrary}
						disabled={isSaving}
						class="flex-1 py-1 text-[10px] bg-neutral-800 hover:bg-neutral-700 text-white rounded transition-colors border border-neutral-700"
					>
						{isSaving ? 'Saving...' : 'Save to Library'}
					</button>
					<button
						onclick={() => {
							customQuestionsMetadata = null;
							customQuestions = null;
							if (questionFileInput) questionFileInput.value = '';
						}}
						class="flex-1 py-1 text-[10px] text-red-500 hover:bg-red-500/10 rounded transition-colors"
					>
						Remove
					</button>
				</div>
			{:else}
				<button
					onclick={() => questionFileInput?.click()}
					class="w-full py-3 border border-dashed border-neutral-700 hover:border-orange-500 hover:bg-orange-500/5 rounded-lg text-neutral-500 hover:text-orange-500 transition-all text-xs font-mono uppercase flex items-center justify-center gap-2"
				>
					<span>+ Upload JSON Intel</span>
				</button>
			{/if}
			<input
				type="file"
				accept=".json"
				class="hidden"
				bind:this={questionFileInput}
				onchange={handleQuestionUpload}
			/>
		{:else}
			<!-- LIBRARY MODE -->
			<div class="space-y-2">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search library..."
					class="w-full bg-black/40 border border-neutral-700 rounded p-2 text-xs text-white placeholder:text-neutral-600 outline-none focus:border-orange-500"
				/>

				<div class="h-40 overflow-y-auto custom-scrollbar space-y-2 pr-1">
					{#if publicQuestions.isLoading}
						<div class="text-[10px] text-neutral-500 text-center py-4">Loading intel...</div>
					{:else if publicQuestions.data}
						{#each publicQuestions.data as set}
							<button
								class="w-full text-left p-2 rounded border transition-all {customQuestions ===
								set.questions
									? 'bg-orange-500/10 border-orange-500'
									: 'bg-black/20 border-neutral-800 hover:border-neutral-600'}"
								onclick={() => {
									customQuestions = set.questions;
									customQuestionsMetadata = {
										title: set.title,
										author: set.author,
										language: set.language || 'Unknown',
										count: set.questions.length
									};
									// Switch back to upload view to show selection
									questionSourceMode = 'upload';
								}}
							>
								<div class="flex justify-between items-start">
									<span class="text-xs font-bold text-white truncate max-w-30">{set.title}</span>
									<span class="text-[9px] text-orange-400 bg-orange-500/10 px-1 rounded"
										>{set.questions.length} Qs</span
									>
								</div>
								<div class="text-[9px] text-neutral-500 truncate flex justify-between">
									<span>By {set.author}</span>
									{#if set.language}
										<span class="text-neutral-600 font-mono">[{set.language}]</span>
									{/if}
								</div>
							</button>
						{/each}
						{#if publicQuestions.data.length === 0}
							<div class="text-[10px] text-neutral-500 text-center py-4">No intel found.</div>
						{/if}
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	/* Thin & Cyberpunk Scrollbar */
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.2);
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #444;
		border-radius: 10px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: #f97316; /* Orange hover */
	}
</style>
