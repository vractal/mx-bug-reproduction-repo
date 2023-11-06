import { Matrix } from 'lib/utils/matrix.utils';
import { EventTimeline, EventType, MatrixEvent, RelationType, RoomEvent, TimelineWindow } from 'matrix-js-sdk';
import {
	activeRoomIdState,
	isLoadingState,
	paginatingBackwardState,
	paginatingForwardState,
	timelineLoadedState,
	timelineState
} from 'lib/recoil/chat.atom';
import { useRecoilState } from 'recoil';
import { useRef } from 'react';

// TODO: generalize the state so that you can use with useChatTimeline('roomId') and have multiple chat windows
export const useChatTimeline = () => {
	const [isLoading, setLoading] = useRecoilState(isLoadingState);
	const [timeline, setTimeline] = useRecoilState(timelineState);
	const [timelineLoaded, setTimelineLoaded] = useRecoilState(timelineLoadedState);
	const [paginatingForward, setPaginatingForward] = useRecoilState(paginatingForwardState);
	const [paginatingBackward, setPaginatingBackward] = useRecoilState(paginatingBackwardState);
	const [activeRoomId, setActiveRoomId] = useRecoilState(activeRoomIdState);
	const timelineWindow = useRef<TimelineWindow | null>(null);

	const fillRequest = async (backwards: boolean) => {
		console.log('fillRequest', backwards);
		if (paginatingForward || paginatingBackward || !timelineWindow.current) {
			return Promise.resolve(true);
		}
		const dir = backwards ? EventTimeline.BACKWARDS : EventTimeline.FORWARDS;

		if (backwards) {
			setPaginatingBackward(true);
		} else {
			setPaginatingForward(true);
		}

		try {
			await timelineWindow.current?.paginate(dir, 50);
		} catch (e) {
			// If we are at the creation of the room, we will get an 'unsigned' error when paginating backwards. Probally sdk bug
			const events = timelineWindow.current.getEvents() ?? [];
			const isAtCreation = events.length && events[0].getType() === EventType.RoomCreate;
			if (isAtCreation && backwards) {
				console.log('Forcefully stopping at room create event', e, events);
				setTimeline(filterEvents(events));
				setPaginatingBackward(false);
				setPaginatingForward(false);
				return Promise.resolve(false); // Doing this to make sure we dont try to paginate forever
			} else {
				// Not sure if I should throw an error here. Didnt happen yet but keep an eye on it
				console.log('Error paginating timeline', e, events, isAtCreation);
			}
		}
		setTimeline(filterEvents(timelineWindow.current.getEvents() ?? []));

		setPaginatingForward(false);
		setPaginatingBackward(false);

		return Promise.resolve(timelineWindow.current.canPaginate(dir));
	};

	const startTimelineWindow = async (roomId: string) => {
		setTimelineLoaded(false);
		setLoading(true);
		stopTimelineWindow();

		if (activeRoomId !== roomId) {
			setActiveRoomId(roomId);
		}
		const client = Matrix.client;
		if (!client) {
			console.log('Error starting timeline: no matrix client');
			return false;
		}
		const timelineSet = client.getRoom(roomId ?? '')?.getUnfilteredTimelineSet();
		if (client && roomId && timelineSet) {
			timelineWindow.current = new TimelineWindow(client, timelineSet, {
				windowLimit: 500
			});

			await timelineWindow.current.load(undefined, 150);
			setTimeline(filterEvents(timelineWindow.current?.getEvents() ?? []));
		}
		Matrix.client?.on(RoomEvent.Timeline, (event, room) => {
			// ,toStartOfTimeline
			Matrix.timelineEventHandler(
				roomId,
				() => {
					setTimeline(filterEvents(timelineWindow.current?.getEvents() ?? []));
				},
				() => {
					// setTimeline(filterEvents(timelineWindow.current?.getEvents() ?? []));
					// setTimeline(filterEvents(timelineWindow.current?.getEvents() ?? []));
					fillRequest(false);
					// setTimeout(() => fillRequest(false), 500);
					// debouncedSetReadMarker();
				}
			)(event, room);
		});

		Matrix.client?.on(
			RoomEvent.LocalEchoUpdated,
			Matrix.localEchoHandler(roomId, () => {
				console.log('local echo updated')
				// setTimeline(filterEvents(timelineWindow?.getEvents() ?? []));
				// console.log('local echo updated 2', timelineWindow?.getEvents())
			})
		);

		setLoading(false);
		setTimelineLoaded(true);
		return true;
	};

	const stopTimelineWindow = () => {
		console.log('timelinewindow stop');
		Matrix.client?.removeAllListeners(RoomEvent.Timeline); // all or specific? Matrix.timelineEventHandler(activeRoomId) Matrix.localEchoHandler(activeRoomId)
		Matrix.client?.removeAllListeners(RoomEvent.LocalEchoUpdated);
		timelineWindow.current = null;
		// setActiveRoomId(null);
		setTimelineLoaded(false);
		setTimeline([]);
	};

	return {
		isLoading,
		timelineLoaded,
		fillRequest,
		paginatingBackward,
		paginatingForward,
		timeline,
		activeRoomId,
		startTimelineWindow,
		stopTimelineWindow
	};
};

const filterEvents = (events: MatrixEvent[]) => {
	return events.filter(event => {
		const eventId = event.getId();
		const eventType = event.getType();
		if (
			(eventType === EventType.RoomMessage ||
				eventType === EventType.RoomCreate ||
				eventType === EventType.PollStart) &&
			!event.isRelation(RelationType.Replace) &&
			eventId
		) {
			return true;
		}
		return false;
	});
};
