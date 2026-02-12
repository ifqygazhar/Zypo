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
