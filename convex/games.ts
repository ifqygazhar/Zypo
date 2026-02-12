import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

const QUESTIONS = [
	{ text: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correct: 1 },
	{
		text: 'What is the output?',
		code: 'console.log(typeof []);',
		options: ["'array'", "'object'", "'null'", "'undefined'"],
		correct: 1
	},
	{
		text: 'Which method adds to end of array?',
		code: 'const arr = [1, 2];\narr.???(3);',
		options: ['push', 'pop', 'shift', 'unshift'],
		correct: 0
	},
	{ text: 'Capital of France?', options: ['London', 'Berlin', 'Paris', 'Rome'], correct: 2 },
	{
		text: 'What does this return?',
		code: "Boolean('false')",
		options: ['true', 'false', 'NaN', 'Error'],
		correct: 0
	},
	{ text: 'Fastest animal?', options: ['Cheetah', 'Lion', 'Eagle', 'Falcon'], correct: 3 }
];

export const createGame = mutation({
	args: {
		playerName: v.string(),
		playerId: v.string(),
		mapId: v.optional(v.string()),
		characterId: v.string(),
		questions: v.optional(
			v.array(
				v.object({
					text: v.string(),
					code: v.optional(v.union(v.string(), v.null())),
					options: v.array(v.string()),
					correct: v.number()
				})
			)
		)
	},
	handler: async (ctx, args) => {
		console.log('createGame args.questions:', args.questions ? args.questions.length : 'undefined');
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
			questions: args.questions,
			participants: [args.playerName],
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

		const existingPlayerByName = game.players.find((p) => p.name === args.playerName);

		if (existingPlayerByName) {
			if (existingPlayerByName.id !== args.playerId) {
				throw new Error('You are already in this game (Check other tabs)!');
			}
			return game._id;
		}

		if (game.status !== 'waiting' && !game.players.some((p) => p.id === args.playerId))
			throw new Error('Game already started');
		if (game.players.length >= 2 && !game.players.some((p) => p.id === args.playerId))
			throw new Error('Game full');

		if (game.players.some((p) => p.id === args.playerId)) return game._id;

		await ctx.db.patch(game._id, {
			participants: [...(game.participants || []), args.playerName], // Add new player
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
		const game = await ctx.db.get(args.gameId);
		if (!game) return null;

		// MAP PLAYERS: Ubah Storage ID menjadi URL Gambar yang bisa dilihat semua orang
		const playersWithUrls = await Promise.all(
			game.players.map(async (p) => {
				let finalImageUrl = p.characterId;

				// Jika ini bukan karakter bawaan (tidak ada di list default)
				// DAN bukan Base64 (berarti ini Storage ID dari Convex)
				const isDefaultChar = ['volcoli', 'viviteel', 'vivitron', 'velocitile'].includes(
					p.characterId || ''
				);

				if (
					p.characterId &&
					!isDefaultChar &&
					!p.characterId.startsWith('data:image') &&
					!p.characterId.startsWith('http')
				) {
					// Convert Storage ID -> Public URL
					const url = await ctx.storage.getUrl(p.characterId);
					if (url) finalImageUrl = url;
				}

				return {
					...p,

					characterId: finalImageUrl
				};
			})
		);

		return { ...game, players: playersWithUrls };
	}
});

export const getByCode = query({
	args: { code: v.string() },
	handler: async (ctx, args) => {
		const game = await ctx.db
			.query('games')
			.withIndex('by_code', (q) => q.eq('code', args.code))
			.unique();

		if (!game) return null;

		const playersWithUrls = await Promise.all(
			game.players.map(async (p) => {
				let finalImageUrl = p.characterId;

				const isDefaultChar = ['volcoli', 'viviteel', 'vivitron', 'velocitile'].includes(
					p.characterId || ''
				);

				if (
					p.characterId &&
					!isDefaultChar &&
					!p.characterId.startsWith('data:image') &&
					!p.characterId.startsWith('http')
				) {
					const url = await ctx.storage.getUrl(p.characterId);
					if (url) finalImageUrl = url;
				}

				return {
					...p,
					characterId: finalImageUrl
				};
			})
		);

		return { ...game, players: playersWithUrls };
	}
});

export const startGame = mutation({
	args: { gameId: v.id('games') },
	handler: async (ctx, args) => {
		const game = await ctx.db.get(args.gameId);
		if (!game) throw new Error('Game not found');

		console.log('startGame questions:', game.questions ? game.questions.length : 'undefined');

		const questionSource = game.questions && game.questions.length > 0 ? game.questions : QUESTIONS;
		const q = questionSource[Math.floor(Math.random() * questionSource.length)];

		await ctx.db.patch(args.gameId, {
			status: 'playing',
			currentQuestion: {
				text: q.text,
				code: q.code,
				options: q.options,
				correctIndex: q.correct,
				startTime: Date.now()
			}
		});
	}
});

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
			const newPlayers = game.players.map((p) => {
				const isOpponent = p.id !== args.playerId;
				console.log(
					`[Processing user] ${p.id} vs Attacker ${args.playerId}. Is Opponent? ${isOpponent}`
				);

				if (isOpponent) {
					return { ...p, hp: Math.max(0, p.hp - 20) };
				} else {
					return { ...p, score: p.score + 100 };
				}
			});

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

				const winnerPlayer = newPlayers.find((p) => p.id === winnerId);
				const loserPlayer = newPlayers.find((p) => p.id !== winnerId);

				if (winnerPlayer && loserPlayer) {
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
				const questionSource =
					game.questions && game.questions.length > 0 ? game.questions : QUESTIONS;

				const currentText = game.currentQuestion?.text;
				const availableQuestions = questionSource.filter((totalQ) => totalQ.text !== currentText);

				const candidates = availableQuestions.length > 0 ? availableQuestions : questionSource;

				const nextQ = candidates[Math.floor(Math.random() * candidates.length)];
				await ctx.db.patch(args.gameId, {
					players: newPlayers,
					currentQuestion: {
						text: nextQ.text,
						code: nextQ.code,
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
		const user = await ctx.db
			.query('users')
			.withIndex('by_username', (q) => q.eq('username', args.playerName))
			.unique();

		const myRank = user?.rank ?? 1000;
		const myCountry = user?.country ?? 'UN';

		let chosenGame = null;

		const isValidGame = (g: any) => {
			return g.players.length < 2 && !g.players.some((p: any) => p.name === args.playerName);
		};

		if (myCountry !== 'UN') {
			const countryGames = await ctx.db
				.query('games')
				.withIndex('by_status_country', (q) =>
					q.eq('status', 'waiting').eq('publicCountry', myCountry)
				)
				.take(20);

			const validCountryGames = countryGames.filter(isValidGame).sort((a, b) => {
				const diffA = Math.abs((a.publicRank ?? 1000) - myRank);
				const diffB = Math.abs((b.publicRank ?? 1000) - myRank);
				return diffA - diffB;
			});

			if (validCountryGames.length > 0) {
				const bestMatch = validCountryGames[0];

				if (Math.abs((bestMatch.publicRank ?? 1000) - myRank) <= 500) {
					chosenGame = bestMatch;
				}
			}
		}

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

			const validGlobalGames = globalGames.filter(isValidGame).sort((a, b) => {
				const diffA = Math.abs((a.publicRank ?? 1000) - myRank);
				const diffB = Math.abs((b.publicRank ?? 1000) - myRank);
				return diffA - diffB;
			});

			if (validGlobalGames.length > 0) {
				chosenGame = validGlobalGames[0];
			}
		}

		if (!chosenGame) {
			const anyGame = await ctx.db
				.query('games')
				.withIndex('by_status', (q) => q.eq('status', 'waiting'))
				.first();

			if (anyGame && isValidGame(anyGame)) {
				chosenGame = anyGame;
			}
		}

		if (chosenGame) {
			await ctx.db.patch(chosenGame._id, {
				participants: [...(chosenGame.participants || []), args.playerName],
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
			});

			return { gameId: chosenGame._id, code: chosenGame.code, status: 'joined' };
		} else {
			const code = Math.random().toString(36).substring(2, 7).toUpperCase();
			const gameId = await ctx.db.insert('games', {
				code,
				mapId: args.mapId || 'metropolis_1.webp',
				status: 'waiting',
				publicRank: myRank,
				publicCountry: myCountry,
				participants: [args.playerName],
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

export const getHistory = query({
	args: {
		username: v.string(),
		limit: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		const games = await ctx.db.query('games').order('desc').take(100);

		const userGames = games.filter((g) => g.participants?.includes(args.username));
		const limitedGames = userGames.slice(0, args.limit || 20);

		return limitedGames.map((g) => {
			const me = g.players.find((p) => p.name === args.username);
			const opponent = g.players.find((p) => p.name !== args.username);
			const isWinner = g.winner === me?.id;
			const isDraw = g.status === 'finished' && !g.winner;

			return {
				_id: g._id,
				code: g.code,
				mapId: g.mapId,
				status: g.status,
				createdAt: g._creationTime,
				myScore: me?.score || 0,
				result: isWinner ? 'WIN' : isDraw ? 'DRAW' : g.status === 'finished' ? 'LOSE' : g.status,
				opponentName: opponent?.name || 'Waiting...'
			};
		});
	}
});
