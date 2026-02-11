import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// Data for Questions (Hardcoded for prototype)
const QUESTIONS = [
	{ text: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correct: 1 },
	{ text: 'Capital of France?', options: ['London', 'Berlin', 'Paris', 'Rome'], correct: 2 },
	{ text: 'Fastest animal?', options: ['Cheetah', 'Lion', 'Eagle', 'Falcon'], correct: 3 },
	{ text: 'Which language is this?', options: ['Java', 'Python', 'TypeScript', 'C++'], correct: 2 },
	{ text: 'Color of the sky?', options: ['Blue', 'Green', 'Red', 'Yellow'], correct: 0 },
	{ text: 'Capital of Japan?', options: ['Seoul', 'Beijing', 'Tokyo', 'Bangkok'], correct: 2 },
	{ text: 'H2O is?', options: ['Gold', 'Silver', 'Water', 'Air'], correct: 2 }
];

export const createGame = mutation({
	args: {
		playerName: v.string(),
		playerId: v.string(),
		mapId: v.optional(v.string()),
		characterId: v.string()
	},
	handler: async (ctx, args) => {
		const code = Math.random().toString(36).substring(2, 7).toUpperCase();
		const gameId = await ctx.db.insert('games', {
			code,
			mapId: args.mapId,
			status: 'waiting',
			players: [
				{
					id: args.playerId,
					name: args.playerName,
					characterId: args.characterId,
					score: 0,
					hp: 100
				}
			]
		});
		return { gameId, code };
	}
});

export const joinGame = mutation({
	args: {
		code: v.string(),
		playerName: v.string(),
		playerId: v.string(),
		characterId: v.string()
	},
	handler: async (ctx, args) => {
		const game = await ctx.db
			.query('games')
			.withIndex('by_code', (q) => q.eq('code', args.code))
			.unique();
		if (!game) throw new Error('Game not found');
		// Relaxed joining condition for re-joining or debugging
		if (game.status !== 'waiting' && !game.players.some((p) => p.id === args.playerId))
			throw new Error('Game already started');
		if (game.players.length >= 2 && !game.players.some((p) => p.id === args.playerId))
			throw new Error('Game full');

		// Check if player already joined
		if (game.players.some((p) => p.id === args.playerId)) return game._id;

		await ctx.db.patch(game._id, {
			players: [
				...game.players,
				{
					id: args.playerId,
					name: args.playerName,
					characterId: args.characterId,
					score: 0,
					hp: 100
				}
			]
		});
		return game._id;
	}
});

export const getGame = query({
	args: { gameId: v.id('games') },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.gameId);
	}
});

export const getByCode = query({
	args: { code: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query('games')
			.withIndex('by_code', (q) => q.eq('code', args.code))
			.unique();
	}
});

export const startGame = mutation({
	args: { gameId: v.id('games') },
	handler: async (ctx, args) => {
		const game = await ctx.db.get(args.gameId);
		if (!game) throw new Error('Game not found');

		// Select random question
		const q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];

		await ctx.db.patch(args.gameId, {
			status: 'playing',
			currentQuestion: {
				text: q.text,
				options: q.options,
				correctIndex: q.correct,
				startTime: Date.now()
			}
		});
	}
});

// The core duel mechanic: First correct answer hits the opponent
export const submitAnswer = mutation({
	args: { gameId: v.id('games'), playerId: v.string(), answerIndex: v.number() },
	handler: async (ctx, args) => {
		const game = await ctx.db.get(args.gameId);
		if (!game || !game.currentQuestion || game.status !== 'playing') return;

		console.log(
			`[submitAnswer] Player ${args.playerId} Answered ${args.answerIndex}. Correct is ${game.currentQuestion.correctIndex}`
		);

		const q = game.currentQuestion;

		if (args.answerIndex === q.correctIndex) {
			// Correct Answer!
			// Apply damage to Opponent
			const newPlayers = game.players.map((p) => {
				const isOpponent = p.id !== args.playerId;
				console.log(
					`[Processing user] ${p.id} vs Attacker ${args.playerId}. Is Opponent? ${isOpponent}`
				);

				if (isOpponent) {
					// Opponent takes damage
					return { ...p, hp: Math.max(0, p.hp - 20) };
				} else {
					// Striker gets score
					return { ...p, score: p.score + 100 };
				}
			});

			// Check win condition
			const opponent = newPlayers.find((p) => p.id !== args.playerId);
			let winnerId = undefined;
			let status = 'playing';

			if (opponent && opponent.hp <= 0) {
				status = 'finished';
				winnerId = args.playerId;
			}

			if (status === 'finished') {
				await ctx.db.patch(args.gameId, {
					players: newPlayers,
					status: 'finished',
					winner: winnerId,
					currentQuestion: undefined
				});
				return 'WIN';
			} else {
				// Next question preparation
				const nextQ = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
				await ctx.db.patch(args.gameId, {
					players: newPlayers,
					currentQuestion: {
						text: nextQ.text,
						options: nextQ.options,
						correctIndex: nextQ.correct,
						startTime: Date.now()
					}
				});
				return 'HIT';
			}
		} else {
			// Wrong Answer!
			return 'MISS';
		}
	}
});

export const quickMatch = mutation({
	args: {
		playerName: v.string(),
		playerId: v.string(),
		characterId: v.string(),
		mapId: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		// 1. Try to find a waiting game with space
		const waitingGames = await ctx.db
			.query('games')
			.withIndex('by_status', (q) => q.eq('status', 'waiting'))
			.take(10); // Take a few to check player count

		const availableGame = waitingGames.find((g) => g.players.length < 2);

		if (availableGame) {
			// Join existing game
			// Check if player already joined (idempotency)
			if (availableGame.players.some((p) => p.id === args.playerId)) {
				return { gameId: availableGame._id, code: availableGame.code, status: 'joined' };
			}

			await ctx.db.patch(availableGame._id, {
				players: [
					...availableGame.players,
					{
						id: args.playerId,
						name: args.playerName,
						characterId: args.characterId,
						score: 0,
						hp: 100
					}
				]
			});

			return { gameId: availableGame._id, code: availableGame.code, status: 'joined' };
		} else {
			// No game found, create new one
			const code = Math.random().toString(36).substring(2, 7).toUpperCase();
			const gameId = await ctx.db.insert('games', {
				code,
				mapId: args.mapId || 'metropolis_1.webp', // Default map if not provided
				status: 'waiting',
				players: [
					{
						id: args.playerId,
						name: args.playerName,
						characterId: args.characterId,
						score: 0,
						hp: 100
					}
				]
			});
			return { gameId, code, status: 'created' };
		}
	}
});
