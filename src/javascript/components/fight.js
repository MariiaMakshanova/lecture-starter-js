import controls from '../../constants/controls';

const CRITICAL_HIT_COOLDOWN = 10000;

export function getHitPower(fighter) {
    const criticalHitChance = Math.random() + 1;

    return fighter.attack * criticalHitChance;
}

export function getBlockPower(fighter) {
    const dodgeChance = Math.random() + 1;

    return fighter.defense * dodgeChance;
}

export function getDamage(attacker, defender) {
    return Math.max(getHitPower(attacker) - getBlockPower(defender), 0);
}

function getHealthBarColor(healthPercent) {
    if (healthPercent > 50) {
        return '#49c96d';
    }

    if (healthPercent > 25) {
        return '#f0b82f';
    }

    return '#e24646';
}

export async function fight(firstFighter, secondFighter) {
    return new Promise(resolve => {
        const pressedKeys = new Set();
        const state = {
            firstFighterHealth: firstFighter.health,
            secondFighterHealth: secondFighter.health,
            firstFighterLastCriticalHit: -CRITICAL_HIT_COOLDOWN,
            secondFighterLastCriticalHit: -CRITICAL_HIT_COOLDOWN,
            isFinished: false
        };
        let onKeyDown;
        let onKeyUp;

        const updateHealthIndicator = (position, currentHealth, initialHealth) => {
            const healthBar = document.getElementById(`${position}-fighter-indicator`);
            const healthPercent = Math.max((currentHealth / initialHealth) * 100, 0);

            healthBar.style.width = `${healthPercent}%`;
            healthBar.style.backgroundColor = getHealthBarColor(healthPercent);
        };

        function removeListeners() {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
        }

        const finishFight = winner => {
            state.isFinished = true;
            removeListeners();
            resolve(winner);
        };

        const hit = (attacker, defender, defenderPosition) => {
            if (state.isFinished) {
                return;
            }

            const isFirstFighterAttacking = attacker === firstFighter;
            const attackerBlockKey = isFirstFighterAttacking ? controls.PlayerOneBlock : controls.PlayerTwoBlock;

            if (pressedKeys.has(attackerBlockKey)) {
                return;
            }

            const defenderBlockKey = isFirstFighterAttacking ? controls.PlayerTwoBlock : controls.PlayerOneBlock;
            const damage = pressedKeys.has(defenderBlockKey) ? getDamage(attacker, defender) : getHitPower(attacker);

            if (isFirstFighterAttacking) {
                state.secondFighterHealth -= damage;
                updateHealthIndicator(defenderPosition, state.secondFighterHealth, secondFighter.health);

                if (state.secondFighterHealth <= 0) {
                    finishFight(firstFighter);
                }

                return;
            }

            state.firstFighterHealth -= damage;
            updateHealthIndicator(defenderPosition, state.firstFighterHealth, firstFighter.health);

            if (state.firstFighterHealth <= 0) {
                finishFight(secondFighter);
            }
        };

        const criticalHit = (attacker, defenderPosition) => {
            if (state.isFinished) {
                return;
            }

            const isFirstFighterAttacking = attacker === firstFighter;
            const lastCriticalHitKey = isFirstFighterAttacking
                ? 'firstFighterLastCriticalHit'
                : 'secondFighterLastCriticalHit';
            const currentTime = Date.now();

            if (currentTime - state[lastCriticalHitKey] < CRITICAL_HIT_COOLDOWN) {
                return;
            }

            state[lastCriticalHitKey] = currentTime;

            if (isFirstFighterAttacking) {
                state.secondFighterHealth -= 2 * firstFighter.attack;
                updateHealthIndicator(defenderPosition, state.secondFighterHealth, secondFighter.health);

                if (state.secondFighterHealth <= 0) {
                    finishFight(firstFighter);
                }

                return;
            }

            state.firstFighterHealth -= 2 * secondFighter.attack;
            updateHealthIndicator(defenderPosition, state.firstFighterHealth, firstFighter.health);

            if (state.firstFighterHealth <= 0) {
                finishFight(secondFighter);
            }
        };

        const isCriticalHitCombinationPressed = combination => combination.every(code => pressedKeys.has(code));

        onKeyDown = event => {
            pressedKeys.add(event.code);

            if (event.code === controls.PlayerOneAttack) {
                hit(firstFighter, secondFighter, 'right');
            }

            if (event.code === controls.PlayerTwoAttack) {
                hit(secondFighter, firstFighter, 'left');
            }

            if (isCriticalHitCombinationPressed(controls.PlayerOneCriticalHitCombination)) {
                criticalHit(firstFighter, 'right');
            }

            if (isCriticalHitCombinationPressed(controls.PlayerTwoCriticalHitCombination)) {
                criticalHit(secondFighter, 'left');
            }
        };

        onKeyUp = event => {
            pressedKeys.delete(event.code);
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
    });
}
