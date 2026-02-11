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
		const user = await ctx.db
			.query('users')
			.withIndex('by_username', (q) => q.eq('username', args.playerName))
			.unique();

		const myRank = user?.rank ?? 1000;
		const myCountry = user?.country ?? 'UN';

		const code = Math.random().toString(36).substring(2, 7).toUpperCase();
		const gameId = await ctx.db.insert('games', {
			code,
			mapId: args.mapId,
			status: 'waiting',
			publicRank: myRank,
			publicCountry: myCountry,
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

				// Update User Ranks
				const winnerPlayer = newPlayers.find((p) => p.id === winnerId);
				const loserPlayer = newPlayers.find((p) => p.id !== winnerId);

				if (winnerPlayer && loserPlayer) {
					// Find Users by Username (assuming unique username enforced at registration)
					const winnerUser = await ctx.db
						.query('users')
						.withIndex('by_username', (q) => q.eq('username', winnerPlayer.name))
						.unique();
					const loserUser = await ctx.db
						.query('users')
						.withIndex('by_username', (q) => q.eq('username', loserPlayer.name))
						.unique();

					if (winnerUser) {
						await ctx.db.patch(winnerUser._id, {
							wins: winnerUser.wins + 1,
							gamesPlayed: winnerUser.gamesPlayed + 1,
							rank: winnerUser.rank + 25
						});
					}

					if (loserUser) {
						await ctx.db.patch(loserUser._id, {
							gamesPlayed: loserUser.gamesPlayed + 1,
							rank: Math.max(0, loserUser.rank - 10)
						});
					}
				}

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
		// 0. Get User Stats
		const user = await ctx.db
			.query('users')
			.withIndex('by_username', (q) => q.eq('username', args.playerName))
			.unique();

		const myRank = user?.rank ?? 1000;
		const myCountry = user?.country ?? 'UN';

		let chosenGame = null;

		// 1. Try to find a waiting game with SAME COUNTRY & SIMILAR RANK (+/- 200)
		if (myCountry !== 'UN') {
			const countryGames = await ctx.db
				.query('games')
				.withIndex('by_status_country', (q) =>
					q.eq('status', 'waiting').eq('publicCountry', myCountry)
				)
				.take(20);

			// Filter for valid games (space available) and sort by rank diff
			const validCountryGames = countryGames
				.filter((g) => g.players.length < 2)
				.sort((a, b) => {
					const diffA = Math.abs((a.publicRank ?? 1000) - myRank);
					const diffB = Math.abs((b.publicRank ?? 1000) - myRank);
					return diffA - diffB;
				});

			if (validCountryGames.length > 0) {
				const bestMatch = validCountryGames[0];
				// Check if rank is within acceptable range (e.g. 500)
				if (Math.abs((bestMatch.publicRank ?? 1000) - myRank) <= 500) {
					chosenGame = bestMatch;
				}
			}
		}

		// 2. If no country match, find ANY game with SIMILAR RANK (Global Search)
		if (!chosenGame) {
			const globalGames = await ctx.db
				.query('games')
				.withIndex('by_status_rank', (q) =>
					q
						.eq('status', 'waiting')
						.gte('publicRank', myRank - 500)
						.lte('publicRank', myRank + 500)
				)
				.take(20);

			const validGlobalGames = globalGames
				.filter((g) => g.players.length < 2)
				.sort((a, b) => {
					const diffA = Math.abs((a.publicRank ?? 1000) - myRank);
					const diffB = Math.abs((b.publicRank ?? 1000) - myRank);
					return diffA - diffB;
				});

			if (validGlobalGames.length > 0) {
				chosenGame = validGlobalGames[0];
			}
		}

		// 3. Last Resort: Any waiting game (Force match higher/lower rank)
		if (!chosenGame) {
			const anyGame = await ctx.db
				.query('games')
				.withIndex('by_status', (q) => q.eq('status', 'waiting'))
				.first();

			if (anyGame && anyGame.players.length < 2) {
				chosenGame = anyGame;
			}
		}

		if (chosenGame) {
			// Join existing game
			if (chosenGame.players.some((p) => p.id === args.playerId)) {
				return { gameId: chosenGame._id, code: chosenGame.code, status: 'joined' };
			}

			await ctx.db.patch(chosenGame._id, {
				players: [
					...chosenGame.players,
					{
						id: args.playerId,
						name: args.playerName,
						characterId: args.characterId,
						score: 0,
						hp: 100
					}
				]
				// Clear public fields since game is now full/playing (optional, or keeping them is fine)
				// We might want to remove them from index query if we switch status to playing later.
			});

			return { gameId: chosenGame._id, code: chosenGame.code, status: 'joined' };
		} else {
			// No game found, Create New Game
			const code = Math.random().toString(36).substring(2, 7).toUpperCase();
			const gameId = await ctx.db.insert('games', {
				code,
				mapId: args.mapId || 'metropolis_1.webp',
				status: 'waiting',
				publicRank: myRank,
				publicCountry: myCountry,
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
