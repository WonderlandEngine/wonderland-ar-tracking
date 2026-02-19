import {defineConfig} from 'vitest/config';
import {resolve} from 'node:path';

export default defineConfig({
    test: {
        include: ['tests/unit/**/*.test.ts'],
        environment: 'node',
    },
    resolve: {
        alias: {
            '@wonderlandengine/api': resolve(__dirname, 'tests/mocks/wonderland-api.ts'),
            '@wonderlandengine/api/decorators.js': resolve(
                __dirname,
                'tests/mocks/wonderland-decorators.ts'
            ),
            '@wonderlandengine/ar-tracking': resolve(
                __dirname,
                'tests/mocks/ar-tracking.ts'
            ),
        },
    },
});
