import { MsgType, type IContent, User, EventType } from 'matrix-js-sdk';
import type { Relations } from 'matrix-js-sdk/lib/models/relations';
import type { RelationType } from 'matrix-js-sdk/src/matrix';

export enum SupportedMsgTypes {
	Text = MsgType.Text,
	Image = MsgType.Image,
	File = MsgType.File,
	Notice = MsgType.Notice
	// Emote = MsgType.Emote,
	// Audio = MsgType.Audio,
	// Location = MsgType.Location,
	// Video = MsgType.Video,
	// KeyVerificationRequest = MsgType.KeyVerificationRequest,
}

export interface IRoomEvent {
	eventId: string;
	eventType: SupportedRoomEvents;
	sender: ISender;
	timestamp: number;
	roomId?: string;
	status?: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: unknown;
}

export enum SupportedRoomEvents {
	Message = 'm.room.message',
	Create = 'm.room.create',
	PollStart = EventType.PollStart
}

export interface ISender {
	userId: string;
	displayName: string;
	avatarUrl?: string;
}

export interface IImageData {
	url: string;
	width: number;
	height: number;
	blurhash?: string;
}
export interface IMessage extends IRoomEvent {
	eventType: SupportedRoomEvents.Message;
	type: SupportedMsgTypes;
	content: IContent;
	imageData?: IImageData;
	url?: string;
	targetId?: string;
	replyTo?: string;
	isContinuation?: boolean;
	isUnread?: boolean;
}
export interface IPollStartEvent extends IRoomEvent {
	eventType: SupportedRoomEvents.PollStart; // include other types
}
export interface IStateEvent extends IRoomEvent {
	eventType: SupportedRoomEvents.Create; // include other types
}
export interface IRoomListItem {
	roomId: string;
	name?: string;
	dmUser?: User;
	lastMessage?: string;
	avatarUrl?: string;
	topic?: string;
	lastReadId?: string; // eventId
	timestamp: number;
	unreadCount?: number;
	// from IHiearchyRoom
	canonical_alias?: string;
	aliases?: string[];
	world_readable?: boolean;
	guest_can_join?: boolean;
	num_joined_members?: number;
	type?: string;
	membership?: string;
}
export interface IMessageEvent {
	eventId?: string;
	message?: string;
	sender?: string;
	senderName?: string;
	sentOn?: Date;
}

export interface PinMessage {
	message: IMessage;
	roomId: string;
}

export class UserVote {
	public constructor(
		public readonly ts: number,
		public readonly sender: string,
		public readonly answers: string[]
	) { }
}

export type GetRelationsForEvent = (
	eventId: string,
	relationType: RelationType | string,
	eventType: EventType | string
) => Relations | null | undefined;
