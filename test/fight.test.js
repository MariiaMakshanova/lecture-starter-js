/* eslint-env node */
/* eslint-disable import/no-extraneous-dependencies */
import assert from 'node:assert/strict';
import { after, afterEach, test } from 'node:test';
import { createServer } from 'vite';

const server = await createServer({ logLevel: 'silent' });
const { getBlockPower, getDamage, getHitPower } = await server.ssrLoadModule('/src/javascript/components/fight.js');
const originalRandom = Math.random;

after(async () => {
    await server.close();
});

afterEach(() => {
    Math.random = originalRandom;
});

test('getHitPower returns attack multiplied by random critical hit chance from 1 to 2', () => {
    Math.random = () => 0.5;

    assert.equal(getHitPower({ attack: 4 }), 6);
});

test('getBlockPower returns defense multiplied by random dodge chance from 1 to 2', () => {
    Math.random = () => 0.25;

    assert.equal(getBlockPower({ defense: 8 }), 10);
});

test('getDamage returns hit power reduced by block power', () => {
    const randomValues = [0.75, 0.25];
    Math.random = () => randomValues.shift();

    assert.equal(getDamage({ attack: 10 }, { defense: 4 }), 12.5);
});

test('getDamage never returns a negative value when block is stronger than hit', () => {
    const randomValues = [0, 1];
    Math.random = () => randomValues.shift();

    assert.equal(getDamage({ attack: 3 }, { defense: 5 }), 0);
});
