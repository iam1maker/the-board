export const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Request to ${url} failed with ${res.status}`);
    }
    return res.json();
};
