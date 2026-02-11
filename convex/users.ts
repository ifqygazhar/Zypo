import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const register = mutation({
	args: {
		username: v.string(),
		country: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const existingUser = await ctx.db
			.query('users')
			.withIndex('by_username', (q) => q.eq('username', args.username))
			.unique();

		if (existingUser) {
			if (args.country && existingUser.country !== args.country) {
				await ctx.db.patch(existingUser._id, { country: args.country });
			}

			return {
				userId: existingUser._id,
				username: existingUser.username,
				isNew: false
			};
		}

		const userId = await ctx.db.insert('users', {
			username: args.username,
			country: args.country,
			rank: 1000,
			wins: 0,
			gamesPlayed: 0,
			createdAt: Date.now()
		});

		return { userId, username: args.username, isNew: true };
	}
});

export const login = mutation({
	args: {
		username: v.string()
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query('users')
			.withIndex('by_username', (q) => q.eq('username', args.username))
			.unique();

		if (!user) {
			return null; // Signals client to register
		}

		return { userId: user._id, username: user.username, rank: user.rank };
	}
});

export const getLeaderboard = query({
	args: {},
	handler: async (ctx) => {
		const users = await ctx.db.query('users').withIndex('by_rank').order('desc').take(100);

		return users.map((u) => ({
			username: u.username,
			country: u.country,
			rank: u.rank,
			wins: u.wins,
			gamesPlayed: u.gamesPlayed
		}));
	}
});
