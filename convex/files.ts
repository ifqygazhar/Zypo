// convex/files.ts
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const generateUploadUrl = mutation({
	args: {},
	handler: async (ctx) => {
		return await ctx.storage.generateUploadUrl();
	}
});

export const getImageUrl = query({
	args: { storageId: v.string() },
	handler: async (ctx, args) => {
		return await ctx.storage.getUrl(args.storageId);
	}
});

export const savePublicAsset = mutation({
	args: {
		storageId: v.string(),
		uploaderName: v.string()
	},
	handler: async (ctx, args) => {
		await ctx.db.insert('public_assets', {
			storageId: args.storageId,
			uploaderName: args.uploaderName,
			createdAt: Date.now()
		});
	}
});

export const getPublicAssets = query({
	args: {},
	handler: async (ctx) => {
		// Ambil 50 gambar terbaru
		const assets = await ctx.db
			.query('public_assets')
			.withIndex('by_createdAt')
			.order('desc')
			.take(50);

		const assetsWithUrl = await Promise.all(
			assets.map(async (a) => ({
				...a,
				url: await ctx.storage.getUrl(a.storageId)
			}))
		);

		return assetsWithUrl.filter((a) => a.url !== null);
	}
});
