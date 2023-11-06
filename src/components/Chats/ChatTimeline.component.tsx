import { useChatTimeline } from 'lib/hooks/useChatTimeline';
import { CircularProgress } from 'components/Progress';
import {
	BidirectionalInfiniteScroller,
	BidirectionalInfiniteScrollerRef
} from './BidirectionalInfiniteScroller.component';
import { useEffect, useRef } from 'react';
import { MatrixEvent } from 'matrix-js-sdk';
import { Box } from '@mui/system';
import { Matrix } from 'lib/utils/matrix.utils';

export const ChatTimeline = ({ roomId, onEditMessage, onReplyMessage }: { roomId: string, onEditMessage: (event: MatrixEvent) => void, onReplyMessage: (event: MatrixEvent) => void }) => {
	const { isLoading, fillRequest, timelineLoaded, timeline, startTimelineWindow } = useChatTimeline();
	const scrollRef = useRef<BidirectionalInfiniteScrollerRef>(null);

	useEffect(() => {
		if (roomId) {
			if (Matrix.client?.getRoom(roomId)?.getMyMembership() === 'join') {
				startTimelineWindow(roomId).then(() => {
					scrollRef?.current?.scrollToBottom();
				});

			} else {
				Matrix.client?.joinRoom(roomId).then(() => {
					startTimelineWindow(roomId).then(() => {
						scrollRef?.current?.scrollToBottom();
					});
				})
			}
		} // eslint-disable-next-line react-hooks/exhaustive-deps
	}, [roomId]);

	useEffect(() => {
		scrollRef?.current?.scrollToBottom();
	}, [timeline.length]);

	return isLoading ? (
		<CircularProgress />
	) : (
		<>
			<BidirectionalInfiniteScroller onFillRequest={fillRequest} loaded={timelineLoaded} ref={scrollRef}>
				{timeline.map((event, index) => {
					const eventId = event.getId()
					return (
						<Box key={eventId ?? index} sx={{ 'margin': '20px' }} >
							<b>{event.sender?.rawDisplayName}</b>
							<p dangerouslySetInnerHTML={{ __html: (event.getContent()?.formatted_body || event.getContent().body) ?? '' }} />
							<Box sx={{ 'display': 'flex' }}>
								<button onClick={() => {
									if (eventId) {
										onEditMessage(event)
									}
								}}>edit</button>
								<button onClick={() => {
									if (eventId) {
										onReplyMessage(event)
									}
								}}>reply</button>
							</Box>
						</Box >
					)
				})}
			</BidirectionalInfiniteScroller >
		</>
	);
};
