import showModal from './modal';
import { createFighterPreview } from '../fighterPreview';

export default function showWinnerModal(fighter) {
    showModal({
        title: `${fighter.name} wins!`,
        bodyElement: createFighterPreview(fighter)
    });
}
