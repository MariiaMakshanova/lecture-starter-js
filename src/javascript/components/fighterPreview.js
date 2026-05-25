import createElement from '../helpers/domHelper';

export function createFighterImage(fighter) {
    const { source, name } = fighter;
    const attributes = {
        src: source,
        title: name,
        alt: name
    };
    const imgElement = createElement({
        tagName: 'img',
        className: 'fighter-preview___img',
        attributes
    });

    return imgElement;
}

export function createFighterPreview(fighter, position) {
    const positionClassName = position === 'right' ? 'fighter-preview___right' : 'fighter-preview___left';
    const fighterElement = createElement({
        tagName: 'div',
        className: `fighter-preview___root ${positionClassName}`
    });

    if (!fighter) {
        return fighterElement;
    }

    const fighterImage = createFighterImage(fighter);
    const details = createElement({ tagName: 'div', className: 'fighter-preview___details' });
    const name = createElement({ tagName: 'span', className: 'fighter-preview___name' });
    const health = createElement({ tagName: 'span', className: 'fighter-preview___property' });
    const attack = createElement({ tagName: 'span', className: 'fighter-preview___property' });
    const defense = createElement({ tagName: 'span', className: 'fighter-preview___property' });

    name.innerText = fighter.name;
    health.innerText = `Health: ${fighter.health}`;
    attack.innerText = `Attack: ${fighter.attack}`;
    defense.innerText = `Defense: ${fighter.defense}`;

    details.append(name, health, attack, defense);
    fighterElement.append(fighterImage, details);
    return fighterElement;
}
