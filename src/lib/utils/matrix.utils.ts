import { MATRIX_BASE_URL } from 'lib/constants/env.constants';
import {
	IImageData,
	IMessage,
	IRoomEvent,
	IStateEvent,
	SupportedMsgTypes,
	SupportedRoomEvents
} from 'lib/types/Chat';
import {
	MatrixClient,
	createClient,
	ClientEvent,
	RoomMemberEvent,
	RoomStateEvent,
	RoomEvent,
	EventType,
	TimelineWindow,
	MatrixEvent,
	Room,
	RelationType,
	IContent,
	Visibility,
	ICreateRoomOpts,
	IndexedDBStore,
	PendingEventOrdering
} from 'matrix-js-sdk';
// import { logger } from 'matrix-js-sdk/src/logger';

import { M_POLL_RESPONSE } from 'matrix-js-sdk/lib/@types/polls';

const MATRIX_BASE_URL = 'https://matrix.org';

// Disable super anoying logs
// logger.disableAll();
export abstract class Matrix {
	public static client: MatrixClient | undefined;

	private static initializing = false;
	public static clientReady = false;
	//  Active chat timeline
	public static activeTimelineWindow: TimelineWindow | null = null;

	public static async logout() {
		await this.client?.logout();
		// await this.client?.clearStores() // leaving this one disabled until confirmed its needed, because will slow login in back

		this.client = undefined;
		return true;
	}

	public static async initializeClient(access_token: string, user_id: string, displayName?: string): Promise<void> {
		if (this.client?.isLoggedIn() || this.initializing) {
			return;
		}

		this.initializing = true;
		console.log('initializing client');

		if (MATRIX_BASE_URL) {
			if (access_token) {
				try {
					// const data = await tempClient.login('org.matrix.login.jwt', { token: token.token });
					let opts = {};
					try {
						const store = new IndexedDBStore({
							indexedDB: window.indexedDB,
							localStorage: window.localStorage,
							dbName: access_token
						});
						await store.startup();
						opts = { store };
					} catch (e) {
						console.log('IndexDB error:', e);
					}
					this.client = createClient({
						baseUrl: MATRIX_BASE_URL,
						accessToken: access_token,
						userId: user_id,
						...opts
					});
					await this.client.startClient({
						initialSyncLimit: 20,
						pendingEventOrdering: PendingEventOrdering.Detached
					});

					await new Promise<void>(resolve => {
						this.client?.once(ClientEvent.Sync, async state => {
							console.log('state: ', state);
							if (state === 'PREPARED') {
								this.clientReady = true;
								resolve();
								this.startClientListeners();
								this.initializing = false;
								// clientReady.set(true);
								// this.initPushers();

								if (displayName) {
									this.client?.setDisplayName(displayName);
								}
							}
						});
					});
				} catch (error) {
					console.log({ error });
				}
			}
		} else {
			console.log('Matrix base url not set');
		}
	}

	private static startClientListeners() {
		// this.client?.on(RoomEvent.Timeline, this.timelineEventHandler(null));
	}
	public static startListeningRoomEvents(roomId: string) {
		if (!this.client) {
			return null;
		}

		// We give a few seconds before enabling notifications again after room load, since  it can trigger events/notif sometimes
		// this.notificationsReady = false;
		// clearTimeout(this.notificationsTimeout);

		this.client.removeAllListeners(RoomEvent.Timeline);

		// room listeners are setup in the hook now

		// this.notificationsTimeout = window.setTimeout(() => {
		//     this.notificationsReady = true;
		// }, 4000);

		this.client.on(RoomStateEvent.Events, (event, room) => {
			console.log('RoomState update', event);
			if (event.event.type === 'm.room.pinned_events' && room.roomId === roomId && event.event.content) {
				// Add values to store, so that we can subscribe to the store and can add pinned messages to the cache
				// pinnedMessagesListener.set(event.event.content.pinned as IMessage[]);
			}
		});
	}

	public static stopListeningRoomEvents() {
		this.client?.removeAllListeners(RoomMemberEvent.Typing);
		this.client?.removeAllListeners(RoomEvent.Timeline);
		this.client?.removeAllListeners(RoomEvent.LocalEchoUpdated);
		this.client?.removeAllListeners(RoomStateEvent.Events);
		// this.client?.on(RoomEvent.Timeline, this.timelineEventHandler(null));
	}

	// Room Listeners
	// They could probally be moved to another file
	public static localEchoHandler =
		(activeRoomId: string | null, echoCallback?: () => void) =>
			(event: MatrixEvent, room: Room, _oldEventId: string | undefined, oldStatus: string | null | undefined) => {
				if (oldStatus === 'sending') {
					if (event.isRelation(RelationType.Replace)) {
						if (event.relationEventId) {
							const targetEvent = room?.findEventById(event.relationEventId);
							targetEvent?.makeReplaced(event);
						}
					} else {
						// updateRoomLastMessage(room.roomId, {
						// 	text: event.getContent()?.body ?? '',
						// 	timestamp: event.getTs()
						// });
					}
					if (room.roomId === activeRoomId) {
						// this.setActiveRoomMessages();
						if (echoCallback) {
							echoCallback();
						}
					}
				}
			};

	public static timelineEventHandler =
		(activeRoomId: string | null, redactCallback?: () => void, newMessageCallback?: () => void) =>
			(event: MatrixEvent, room: Room | undefined) => {
				if (event.event.type === 'm.reaction' && room?.roomId === activeRoomId && event.event.content) {
					// Add values to store, so that we can subscribe to the store and can add reactions to the cache
					// reactionListener.set(true);
				}

				const eventType = event.getType();
				if (
					![
						EventType.RoomMessage,
						EventType.RoomRedaction,
						EventType.PollStart,
						M_POLL_RESPONSE.unstable?.toString()
					].includes(eventType)
				) {
					return;
				}
				const activeRoom = activeRoomId ? this.client?.getRoom(activeRoomId) : null;

				const isReplace = event.isRelation(RelationType.Replace);
				const redactedEventId = event.event?.redacts;
				if (redactedEventId) {
					const redactedEvent = room?.findEventById(redactedEventId);
					if (redactedEvent) {
						redactedEvent.makeRedacted(event);
						if (redactCallback) {
							redactCallback();
						}
					}
				}

				if (isReplace) {
					if (event.relationEventId) {
						const targetEvent = room?.findEventById(event.relationEventId);
						if (targetEvent?.status === 'sent') {
							targetEvent?.makeReplaced(event);
						}
					}
				}

				if (!isReplace && !redactedEventId) {
					const text = event.getContent()?.body;
					if (text) {
						if (room) {
							// updateRoomLastMessage(room.roomId, { text, timestamp: event.getTs() });
						}
					}
				}

				if ((!activeRoom || room?.roomId !== activeRoomId) && !isReplace) {
					// const pushActions = this.client?.getPushActionsForEvent(event);
					// TODO: MATRIX - Notifications
					// if (this.notificationsReady && pushActions?.notify) {
					//     if (room) {
					//         const currentCount = room.getUnreadNotificationCount() ?? 0;
					//         // logic for mentions will come here
					//         updateRoomUnreadCount(room.roomId, currentCount);
					//         showNotification(room, event.getContent()?.body);
					//     }
					// }
				}

				if (activeRoom && room?.roomId === activeRoomId) {
					if (newMessageCallback) {
						newMessageCallback();
					}

					// TODO: MATRIX - Chat File list
					// if (event.getContent()?.msgtype === 'm.file' || event.getContent()?.msgtype === 'm.image') {
					//     window?.queryClient?.invalidateQueries([
					//         constants.QUERY_KEYS.MX_ROOM_FILE_LIST,
					//         activeRoom.roomId
					//     ]);
					// }
				}
			};

	// message related utils, parsers, etc. Can also probally be moved to its own thing
	public static getDataFromRoomMessage(event: MatrixEvent): IMessage | null {
		if (!this.client) {
			return null;
		}
		const eventType = event.getType();
		const content = event.getContent();
		if (eventType !== EventType.RoomMessage || !content.body) {
			return null;
		}
		const msgType = content.msgtype ?? '';

		if (msgType in SupportedMsgTypes) {
			const senderId = event.getSender();
			if (!senderId) {
				return null;
			}

			// todo: check other methods for getting displayname
			const sender = this.client.getUser(senderId);
			const avatarUrl = this.client?.mxcUrlToHttp(sender?.avatarUrl ?? '') ?? undefined;
			const displayName = sender?.displayName ?? '';

			const timestamp = event.getTs();
			const eventId = event.getId();
			const roomId = event.getRoomId();
			const targetId = this.getReplyIdFromEvent(event) ?? '';

			const message: IMessage = {
				sender: { userId: senderId, displayName, avatarUrl },
				type: msgType as unknown as SupportedMsgTypes,
				eventType: SupportedRoomEvents.Message,
				timestamp,
				eventId: eventId ?? '',
				roomId,
				content: content,
				targetId
			};

			if (msgType === SupportedMsgTypes.Image) {
				message.imageData = Matrix.getImageMsgInfo(content);
			}

			return message;
		}
		return null;
	}

	public static getDataFromPoll(event: MatrixEvent): IRoomEvent | null {
		// TODO: DEDUPLICATE THIS
		if (!this.client) {
			return null;
		}

		const senderId = event.getSender();
		const eventId = event.getId();
		if (!senderId || !eventId) {
			return null;
		}
		const sender = this.client.getUser(senderId);
		const displayName = sender?.displayName ?? '';
		const avatarUrl = this.client?.mxcUrlToHttp(sender?.avatarUrl ?? '') ?? undefined;

		const timestamp = event.getTs();

		const content = event.getContent();

		const roomId = event.getRoomId();
		// const responses = poll?.getResponses() ?? 0;

		const count =
			Matrix.client
				?.getRoom(roomId ?? '')
				?.getLiveTimeline()
				.getTimelineSet()
				?.relations?.getChildEventsForEvent(
					eventId,
					'm.reference',
					M_POLL_RESPONSE.unstable?.toString() ?? M_POLL_RESPONSE.toString()
				)
				?.getRelations()?.length ?? 0;
		const question = content?.question?.body ?? '';
		const roomEvent: IRoomEvent = {
			eventId: eventId,
			eventType: SupportedRoomEvents.PollStart,
			sender: { userId: senderId, displayName, avatarUrl },
			roomId,
			content,
			count: count,
			question,
			timestamp
		};
		return roomEvent;
	}
	public static getDataFromStateEvent(event: MatrixEvent): IStateEvent | null {
		if (!this.client) {
			return null;
		}
		const eventType = event.getType();

		if (eventType !== EventType.RoomCreate) {
			return null;
		}
		const senderId = event.getSender();
		if (!senderId) {
			return null;
		}
		const sender = this.client.getUser(senderId);
		const displayName = sender?.displayName ?? '';
		const timestamp = event.getTs();

		const content = event.getContent();

		const eventId = event.getId();
		const roomId = event.getRoomId();

		const roomEvent: IStateEvent = {
			eventId: eventId ?? '',
			eventType: SupportedRoomEvents.Create,
			sender: { userId: senderId, displayName },
			roomId,
			content,
			timestamp
		};

		return roomEvent;
	}

	private static getReplyIdFromEvent = (event: MatrixEvent) => {
		const content = event.getOriginalContent();
		const replyEventId = content['m.relates_to']?.['m.in_reply_to']?.event_id;
		return replyEventId;
	};

	public static getImageMsgInfo(content: IContent): IImageData | undefined {
		if (content == null) {
			return undefined;
		}
		const imageWidth = content.info?.w;
		const imageHeight = content.info?.h;
		const imageHash = content.info?.['xyz.amorgan.blurhash'];
		const url = this.client?.mxcUrlToHttp(content.url);
		return url
			? {
				url,
				width: imageWidth,
				height: imageHeight,
				blurhash: imageHash
			}
			: undefined;
	}


	public static async createRoom({
		name,
		topic = 'General Discussion',
		visibility = Visibility.Public,
		roomAlias,
		parentRoomId,
	}: {
		name: string;
		topic?: string;
		visibility?: Visibility;
		roomAlias?: string;
		parentRoomId?: string;
		type?: string;
	}): Promise<string | null> {
		if (!this.client) {
			return null;
		}

		try {
			const creationOpts: ICreateRoomOpts = {
				name,
				visibility,
				topic,
				room_alias_name: roomAlias,
			};

			if (parentRoomId) {
				// TODO: Find a way to add this to old rooms would help simplifing notifications
				creationOpts.initial_state = [
					{
						type: EventType.SpaceParent,
						state_key: parentRoomId,
						content: {
							canonical: true,
							via: [MATRIX_BASE_URL.replace('https://matrix', '').replace('https://', '')]
						}
					}
				];
			}
			const newRoom = await this.client.createRoom(creationOpts);

			if (parentRoomId) {
				await this.addRoomToSpace(newRoom.room_id, parentRoomId);
			}

			return newRoom.room_id;
		} catch (error) {
			console.error('Error creating room: ', error);
			return null;
		}
	}

	public static async addRoomToSpace(roomId: string, spaceId: string) {
		await this.client?.sendStateEvent(
			spaceId,
			EventType.SpaceChild,
			{
				via: [MATRIX_BASE_URL.replace('https://matrix', '').replace('https://', '')],
				suggested: true,
				auto_join: true
			},
			roomId
		);
	}
}

export const parseMessageData = (event: MatrixEvent): IMessage | null => {
	let messageData = null;
	const eventId = event.getId();
	const eventType = event.getType();
	if (
		(eventType === EventType.RoomMessage || eventType === EventType.RoomCreate || eventType === EventType.PollStart) &&
		!event.isRelation(RelationType.Replace) &&
		eventId
	) {
		switch (eventType) {
			case EventType.RoomMessage:
				messageData = Matrix.getDataFromRoomMessage(event);
				break;
			// TODO: Reimplement other event types
			// case EventType.RoomCreate:
			//     messageData = Matrix.getDataFromStateEvent(event);
			//     break;
			// case EventType.PollStart:
			//     messageData = Matrix.getDataFromPoll(event);
			//     break;
		}
	}

	return messageData;
};
