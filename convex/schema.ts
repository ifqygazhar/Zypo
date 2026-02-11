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
		winner: v.optional(v.string()) // Player ID of the winner
	}).index('by_code', ['code'])
});
