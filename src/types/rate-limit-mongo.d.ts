declare module 'rate-limit-mongo' {
    import { Store } from 'express-rate-limit';

    interface MongoStoreOptions {
        uri: string;
        collectionName?: string;
        expireTimeMs?: number;
        resetExpireDate?: boolean;
        errorHandler?: (error: Error) => void;
        // Add other options as needed based on the library's documentation
    }

    class MongoStore implements Store {
        constructor(options: MongoStoreOptions);
        increment(key: string): Promise<{ totalHits: number; resetTime: Date }>;
        decrement(key: string): void;
        resetKey(key: string): void;
        resetAll(): void;
    }

    export = MongoStore;
}
