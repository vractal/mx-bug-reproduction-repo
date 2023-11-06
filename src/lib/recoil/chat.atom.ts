import { MatrixEvent } from 'matrix-js-sdk';
import { atom } from 'recoil';

// Chat timeline states
export const activeRoomIdState = atom<string | null>({
	key: 'activeRoomIdState',
	default: null
});

export const isLoadingState = atom<boolean>({
	key: 'isLoadingState',
	default: false
});

export const timelineState = atom<MatrixEvent[]>({
	key: 'timelineState',
	default: []
});

export const timelineLoadedState = atom<boolean>({
	key: 'timelineLoadedState',
	default: false
});

export const paginatingForwardState = atom<boolean>({
	key: 'paginatingForwardState',
	default: false
});

export const paginatingBackwardState = atom<boolean>({
	key: 'paginatingBackwardState',
	default: false
});
