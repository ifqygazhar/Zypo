export default function formatError(err: any): string {
	const raw = err.message || String(err);

	if (raw.includes('Uncaught Error:')) {
		return raw.split('Uncaught Error:')[1].trim().split('\n')[0];
	}

	return raw.replace(/\[.*?\]/g, '').trim();
}
