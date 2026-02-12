import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const create = mutation({
	args: {
		title: v.string(),
		author: v.string(),
		language: v.optional(v.string()), // Added language field
		description: v.optional(v.string()),
		questions: v.array(
			v.object({
				text: v.string(),
				code: v.optional(v.string()),
				options: v.array(v.string()),
				correct: v.number()
			})
		),
		isPublic: v.boolean(),
		creatorId: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const id = await ctx.db.insert('question_sets', {
			title: args.title,
			author: args.author,
			language: args.language, // Store language
			description: args.description,
			questions: args.questions,
			isPublic: args.isPublic,
			creatorId: args.creatorId,
			createdAt: Date.now()
		});
		return id;
	}
});

export const list = query({
	args: {},
	handler: async (ctx) => {
		const results = await ctx.db
			.query('question_sets')
			.filter((q) => q.eq(q.field('isPublic'), true))
			.order('desc')
			.take(20);
		console.log('list query results:', results);
		return results;
	}
});

export const search = query({
	args: { query: v.string() },
	handler: async (ctx, args) => {
		if (!args.query) {
			return await ctx.db
				.query('question_sets')
				.filter((q) => q.eq(q.field('isPublic'), true))
				.order('desc')
				.take(20);
		}

		return await ctx.db
			.query('question_sets')
			.withSearchIndex('search_title_author', (q) =>
				q.search('title', args.query).eq('isPublic', true)
			)
			.take(20);
	}
});

export const get = query({
	args: { id: v.id('question_sets') },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	}
});

export const seed = mutation({
	args: {},
	handler: async (ctx) => {
		const defaultSets = [
			{
				title: 'Casual Trivia',
				author: 'Zypo System',
				language: 'English',
				description: 'Fun and easy questions for everyone.',
				isPublic: true,
				questions: [
					{
						text: 'What is the capital of France?',
						options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
						correct: 2
					},
					{
						text: 'Which planet is known as the Red Planet?',
						options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
						correct: 1
					},
					{
						text: 'What is 5 + 3?',
						options: ['53', '8', '15', '2'],
						correct: 1
					}
				]
			},
			{
				title: 'Trivia Santai',
				author: 'Zypo System',
				language: 'Indonesian',
				description: 'Pertanyaan seru dan mudah untuk semua orang.',
				isPublic: true,
				questions: [
					{
						text: 'Apa ibu kota Indonesia?',
						options: ['Bandung', 'Jakarta', 'Surabaya', 'Medan'],
						correct: 1
					},
					{
						text: 'Binatang apa yang bisa hidup di air dan darat?',
						options: ['Kucing', 'Katak', 'Ayam', 'Sapi'],
						correct: 1
					},
					{
						text: 'Warna bendera Indonesia adalah?',
						options: ['Merah Putih', 'Putih Merah', 'Biru Putih', 'Merah Kuning'],
						correct: 0
					}
				]
			},
			{
				title: 'Basic Math',
				author: 'Zypo System',
				language: 'English',
				description: 'Simple arithmetic challenges.',
				isPublic: true,
				questions: [
					{
						text: '12 + 15 = ?',
						options: ['25', '27', '30', '22'],
						correct: 1
					},
					{
						text: '10 * 5 = ?',
						options: ['50', '15', '5', '100'],
						correct: 0
					},
					{
						text: '100 / 4 = ?',
						options: ['20', '25', '24', '10'],
						correct: 1
					}
				]
			},
			{
				title: 'Matematika Dasar',
				author: 'Zypo System',
				language: 'Indonesian',
				description: 'Tantangan aritmatika sederhana.',
				isPublic: true,
				questions: [
					{
						text: '20 - 8 = ?',
						options: ['10', '12', '14', '11'],
						correct: 1
					},
					{
						text: '6 x 7 = ?',
						options: ['42', '36', '48', '40'],
						correct: 0
					},
					{
						text: '50 / 2 = ?',
						options: ['20', '30', '25', '15'],
						correct: 2
					}
				]
			},
			{
				title: 'Programming Basics',
				author: 'Zypo System',
				language: 'English',
				description: 'Fundamental coding questions.',
				isPublic: true,
				questions: [
					{
						text: 'What does HTML stand for?',
						options: [
							'Hyper Text Markup Language',
							'Home Tool Markup Language',
							'Hyperlinks and Text Markup Language',
							'Hyper Tool Multi Language'
						],
						correct: 0
					},
					{
						text: 'Which language is used for styling web pages?',
						options: ['HTML', 'CSS', 'JavaScript', 'XML'],
						correct: 1
					},
					{
						text: 'What is the output of `console.log(typeof [])` in JavaScript?',
						code: 'console.log(typeof [])',
						options: ['array', 'object', 'undefined', 'list'],
						correct: 1
					}
				]
			},
			{
				title: 'Dasar Pemrograman',
				author: 'Zypo System',
				language: 'Indonesian',
				description: 'Pertanyaan dasar tentang coding.',
				isPublic: true,
				questions: [
					{
						text: 'Apa kepanjangan dari CPU?',
						options: [
							'Central Processing Unit',
							'Central Process Unit',
							'Computer Personal Unit',
							'Central Processor Unit'
						],
						correct: 0
					},
					{
						text: 'Bahasa pemrograman manakah yang berjalan di browser?',
						options: ['Java', 'C++', 'JavaScript', 'Python'],
						correct: 2
					},
					{
						text: 'Apa output dari kode berikut?',
						code: 'print(2 ** 3)',
						options: ['6', '8', '9', '5'],
						correct: 1
					}
				]
			}
		];

		let count = 0;
		for (const set of defaultSets) {
			const existing = await ctx.db
				.query('question_sets')
				.withSearchIndex('search_title_author', (q) =>
					q.search('title', set.title).eq('isPublic', true)
				)
				.first();

			// Double check validation using filter if search index is fuzzy,
			const existingExact = await ctx.db
				.query('question_sets')
				.withIndex('by_author', (q) => q.eq('author', set.author))
				.filter((q) => q.eq(q.field('title'), set.title))
				.first();

			if (!existingExact) {
				await ctx.db.insert('question_sets', {
					...set,
					createdAt: Date.now()
				});
				count++;
			}
		}

		console.log(`Seeding complete. Inserted ${count} new question sets.`);
		return `Seeding complete. Inserted ${count} new question sets.`;
	}
});
