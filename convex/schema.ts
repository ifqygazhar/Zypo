import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	games: defineTable({
		code: v.string(),
		mapId: v.optional(v.string()),
		status: v.string(),
		players: v.array(
			v.object({
				id: v.string(),
				name: v.string(),
				characterId: v.optional(v.string()),
				score: v.number(),
				hp: v.number()
			})
		),
		currentQuestion: v.optional(
			v.object({
				text: v.string(),
				code: v.optional(v.string()), // Added code field
				options: v.array(v.string()),
				correctIndex: v.number(),
				startTime: v.number()
			})
		),
		winner: v.optional(v.string()),
		publicRank: v.optional(v.number()),
		publicCountry: v.optional(v.string()),
		questions: v.optional(
			v.array(
				v.object({
					text: v.string(),
					code: v.optional(v.string()),
					options: v.array(v.string()),
					correct: v.number()
				})
			)
		),
		participants: v.optional(v.array(v.string())) // For efficient history query
	})
		.index('by_code', ['code'])
		.index('by_status', ['status'])
		.index('by_status_rank', ['status', 'publicRank'])
		.index('by_status_country', ['status', 'publicCountry'])
		.index('by_participants', ['participants']),

	users: defineTable({
		username: v.string(),
		pin: v.optional(v.string()),
		country: v.optional(v.string()),
		rank: v.number(),
		wins: v.number(),
		gamesPlayed: v.number(),
		createdAt: v.number()
	})
		.index('by_username', ['username'])
		.index('by_rank', ['rank']),
	public_assets: defineTable({
		storageId: v.string(),
		uploaderName: v.string(),
		createdAt: v.number()
	}).index('by_createdAt', ['createdAt']),

	question_sets: defineTable({
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
		creatorId: v.optional(v.string()), // user ID from our users table or auth
		createdAt: v.number()
	})
		.searchIndex('search_title_author', {
			searchField: 'title',
			filterFields: ['isPublic']
		})
		.index('by_author', ['author'])
});
