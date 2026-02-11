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
				options: v.array(v.string()),
				correctIndex: v.number(),
				startTime: v.number()
			})
		),
		winner: v.optional(v.string()),
		publicRank: v.optional(v.number()),
		publicCountry: v.optional(v.string())
	})
		.index('by_code', ['code'])
		.index('by_status', ['status'])
		.index('by_status_rank', ['status', 'publicRank'])
		.index('by_status_country', ['status', 'publicCountry']),

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
		.index('by_rank', ['rank'])
});
