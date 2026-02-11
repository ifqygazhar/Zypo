import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	games: defineTable({
		code: v.string(),
		mapId: v.optional(v.string()),
		status: v.string(), // "waiting", "playing", "finished"
		players: v.array(
			v.object({
				id: v.string(), // Client-side generated ID or Convex User ID (using random string for no-auth simplicity)
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
				startTime: v.number() // Timestamp for speed calculation
			})
		),
		winner: v.optional(v.string()), // Player ID of the winner
		publicRank: v.optional(v.number()), // Rank of the host/waiting player
		publicCountry: v.optional(v.string()) // Country of the host/waiting player
	})
		.index('by_code', ['code'])
		.index('by_status', ['status'])
		.index('by_status_rank', ['status', 'publicRank'])
		.index('by_status_country', ['status', 'publicCountry']),
	users: defineTable({
		username: v.string(),
		country: v.optional(v.string()), // ISO country code e.g. "ID", "US"
		rank: v.number(), // Elo or simple points, default 1000
		wins: v.number(),
		gamesPlayed: v.number(),
		createdAt: v.number()
	})
		.index('by_username', ['username'])
		.index('by_rank', ['rank'])
});
