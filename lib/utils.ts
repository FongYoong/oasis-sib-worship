export const isPresentOrFutureDate = (date: Date) => {
    const today = new Date();
    return date.setHours(0, 0, 0, 0) >= today.setHours(0, 0, 0, 0);
};

export const json_fetcher = (method: string, body?: object) => (url: string) => fetch(url, {method: method, body: JSON.stringify(body)}).then(r => r.json());

