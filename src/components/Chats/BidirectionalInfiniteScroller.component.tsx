import { Box } from '@mui/material';
import { CircularProgress } from 'components/Progress';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

export interface BidirectionalInfiniteScrollerRef {
	scrollToBottom: () => void;
}

type BidirectionalInfiniteScrollerProps = {
	children: React.ReactNode;
	onFillRequest: (backwards: boolean) => Promise<boolean>; // true if there is more to fetch TODO: change to enum?
	loaded: boolean;
};

export const BidirectionalInfiniteScroller = forwardRef<
	BidirectionalInfiniteScrollerRef,
	BidirectionalInfiniteScrollerProps
>(({ children, onFillRequest, loaded }, ref) => {
	const divscrollRef = useRef<HTMLDivElement>(null);
	const [canFetchBackwards, setCanFetchBackwards] = useState(true);
	const [loadingBackwards, setLoadingBackwards] = useState(false);
	const [loadingForward, setLoadingForward] = useState(false);
	const { ref: forwardRef } = useInView({
		onChange: inView => {
			if (inView) {

				fetchForward();
			}
		}
	});
	useImperativeHandle(ref, () => ({
		scrollToBottom
	}));

	const scrollToBottom = () => {
		if (divscrollRef?.current) {
			divscrollRef.current.scrollTop = divscrollRef.current?.scrollHeight;
		}
	};

	const { ref: backwardsRef } = useInView({
		onChange: inView => {
			if (inView) {
				console.log('fetching backwards inviw')
				fetchBackwards();
			}
		}
	});

	const fetchBackwards = async () => {
		if (loadingBackwards || !divscrollRef?.current || !canFetchBackwards) {
			return;
		}

		setLoadingBackwards(true);
		const first = divscrollRef.current?.firstElementChild?.nextElementSibling as HTMLDivElement;
		const scrolltopBefore = divscrollRef.current?.scrollTop;
		const offsetTopBefore = first?.offsetTop;

		divscrollRef.current.style.overflowY = 'hidden';
		const canFetchMore = await onFillRequest(true);
		const offsetTopAfter = first?.offsetTop;
		divscrollRef.current.scrollTop = scrolltopBefore + (offsetTopAfter - offsetTopBefore);
		divscrollRef.current.style.overflowY = 'auto';
		setLoadingBackwards(false);
		setCanFetchBackwards(canFetchMore);
	};

	const fetchForward = async () => {
		if (loadingForward || !divscrollRef?.current) {
			return;
		}
		setLoadingForward(true);
		const last = divscrollRef.current?.lastElementChild?.previousElementSibling as HTMLDivElement;
		const scrolltopBefore = divscrollRef.current?.scrollTop;
		const offsetTopBefore = last?.offsetTop;
		divscrollRef.current.style.overflowY = 'hidden';
		await onFillRequest(false);
		const offsetTopAfter = last?.offsetTop;
		divscrollRef.current.scrollTop = scrolltopBefore + (offsetTopAfter - offsetTopBefore);
		divscrollRef.current.style.overflowY = 'auto';
		setLoadingForward(false);
	};

	return (
		loaded && (
			<Box ref={divscrollRef} sx={{ height: '100%', width: '100%', overflowY: 'auto', padding: '0 10px' }}>
				{loadingBackwards ? (
					<Box sx={{ height: '40px', width: '100%', 'margingTop': '40px', display: 'flex', justifyContent: 'center' }}>
						<CircularProgress />
					</Box>
				) : (
					<Box sx={{ height: '40px' }} ref={backwardsRef} />
				)}
				{children}
				{loadingForward ? (
					<Box sx={{ height: '40px', width: '100%', display: 'flex', justifyContent: 'center' }}>
						<CircularProgress />
					</Box>
				) : (
					<Box sx={{ height: '40px' }} ref={forwardRef} />
				)}
			</Box>
		)
	);
});
