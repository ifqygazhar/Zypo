import { api } from '../../../convex/_generated/api';

export async function processAndUploadImage(
	file: File,
	convexClient: any, // ConvexClient dari $lib/convex.svelte
	uploaderName: string
): Promise<{ storageId: string; previewUrl: string }> {
	return new Promise((resolve, reject) => {
		if (file.size > 2 * 1024 * 1024) {
			reject(new Error('File size exceeds 2MB limit.'));
			return;
		}

		const reader = new FileReader();

		reader.onload = (event) => {
			const img = new Image();
			img.onload = async () => {
				try {
					const canvas = document.createElement('canvas');
					const ctx = canvas.getContext('2d');
					const size = 150;
					canvas.width = size;
					canvas.height = size;

					if (!ctx) {
						reject(new Error('Failed to get canvas context'));
						return;
					}

					const ratio = Math.max(size / img.width, size / img.height);
					const centerShift_x = (size - img.width * ratio) / 2;
					const centerShift_y = (size - img.height * ratio) / 2;

					ctx.drawImage(
						img,
						0,
						0,
						img.width,
						img.height,
						centerShift_x,
						centerShift_y,
						img.width * ratio,
						img.height * ratio
					);

					canvas.toBlob(
						async (blob) => {
							if (!blob) {
								reject(new Error('Canvas conversion failed'));
								return;
							}

							const previewUrl = URL.createObjectURL(blob);

							try {
								const uploadUrl = await convexClient.mutation(api.files.generateUploadUrl);

								const result = await fetch(uploadUrl, {
									method: 'POST',
									headers: { 'Content-Type': blob.type },
									body: blob
								});

								if (!result.ok) throw new Error('Upload fetch failed');

								const { storageId } = await result.json();

								await convexClient.mutation(api.files.savePublicAsset, {
									storageId,
									uploaderName: uploaderName || 'Anon'
								});

								resolve({ storageId, previewUrl });
							} catch (err) {
								reject(err);
							}
						},
						'image/webp',
						0.8
					);
				} catch (err) {
					reject(err);
				}
			};
			img.onerror = (e) => reject(new Error('Failed to load image'));
			img.src = event.target?.result as string;
		};

		reader.onerror = (e) => reject(new Error('Failed to read file'));
		reader.readAsDataURL(file);
	});
}
