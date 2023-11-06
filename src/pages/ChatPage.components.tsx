import { Box } from '@mui/material';
import { ChatTimeline } from 'components/Chats';
import { Matrix } from 'lib/utils/matrix.utils';
import { MatrixEvent, Room } from 'matrix-js-sdk';
import { useState } from 'react';

export const ChatPage = () => {
    const [message, setMessage] = useState('');
    const [roomId, setRoomId] = useState('');
    const [roomIdInput, setRoomIdInput] = useState('!XYFSnjrLJLltuQKYNK:matrix.org');
    const [userId, setUserId] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [rooms, setRooms] = useState<Room[]>([]);
    const [editMessage, setEditMessage] = useState<MatrixEvent | null>(null);
    const [replyMessage, setReplyMessage] = useState<MatrixEvent | null>(null);

    const login = async (ev: React.FormEvent<HTMLFormElement>) => {
        ev.preventDefault();
        await Matrix.initializeClient(accessToken, userId)
        setRooms(Matrix.client?.getRooms() ?? []);
    }

    const getRooms = async () => {
        if (!Matrix.client) { return; }
        const rooms = Matrix.client.getRooms();
        console.log(Matrix.client.isLoggedIn(), rooms)
        setRooms(rooms);
    }

    const onSend = (ev: React.FormEvent<HTMLFormElement>) => {
        ev.preventDefault();
        if (!roomId || !Matrix.client) { return };
        if (editMessage) {
            console.log('edit message')
            sendEditMessage();
        } else if (replyMessage) {
            sendReplyMessage();
        } else {
            Matrix.client?.sendTextMessage(roomId, message);
            setMessage('');
        }
    }

    const onEdit = (event: MatrixEvent) => {
        setEditMessage(event);
        setMessage(event.getContent()?.body ?? '');
    }

    const onReply = (event: MatrixEvent) => {
        setReplyMessage(event);
    }

    const sendEditMessage = () => {
        Matrix.client?.sendEvent(roomId, 'm.room.message', {
            msgtype: 'm.text',
            'org.matrix.msc1767.text': message,
            body: message,
            'm.new_content': {
                'org.matrix.msc1767.text': message,
                body: message,
                msgtype: 'm.text'
            },
            'm.relates_to': {
                rel_type: 'm.replace',
                event_id: editMessage?.getId()
            }
        });
        setMessage('');
        setEditMessage(null);
    }

    const sendReplyMessage = async (): Promise<void> => {
        const targetEventId = replyMessage?.getId();
        if (!targetEventId) {
            setReplyMessage(null);
            return;
        }
        const targetEvent = Matrix.client?.getRoom(roomId)?.findEventById(targetEventId);
        const sender = targetEvent?.getSender();

        if (!sender || !targetEvent) {
            throw new Error('Missing target event or user');
        }

        const senderUser = Matrix.client?.getUser(sender);
        await Matrix.client?.sendEvent(roomId, 'm.room.message', {
            body: message,
            msgtype: 'm.text',
            format: 'org.matrix.custom.html',
            formatted_body: `<mx-reply>
          <blockquote>
            <a href="https://matrix.to/#/${roomId}/${targetEventId}">In reply to</a>
            <a href="https://matrix.to/#/${targetEvent.sender}">${senderUser?.displayName}</a>
            <br />
            ${targetEvent.getContent().body}
          </blockquote>
        </mx-reply>
       ${message}`,
            'm.relates_to': {
                'm.in_reply_to': {
                    event_id: targetEventId
                }
            }
        });
        setMessage('');
        setReplyMessage(null);
    };


    const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(event.target.value);
    }

    const handleUserIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUserId(event.target.value);
    }

    const handleAccessTokenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAccessToken(event.target.value);
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div style={{ marginRight: '2em' }}>
                <h2>Rooms</h2>
                <input type="text" placeholder="Set room Id to load" value={roomIdInput} onChange={(event) => setRoomIdInput(event.target.value)} />
                <button onClick={() => setRoomId(roomIdInput)}>Load Room</button>
                <small>(set to a default room id with a test room, but can use anything)</small>
                <p>or load from the room list bellow</p>
                <button onClick={getRooms}>Get Rooms</button>
                <Box sx={{ 'maxHeight': '400px', 'overflowY': 'auto' }}>

                    {rooms.map((room) => (
                        <div key={room.roomId}>
                            <p>{room.name}</p>
                            <button onClick={() => setRoomId(room.roomId)}>load</button>
                        </div>
                    ))
                    }
                </Box>
                <form onSubmit={login}>
                    <h2>Login</h2>
                    <label>
                        User ID:
                    </label>
                    <br />
                    <input type="text" value={userId} onChange={handleUserIdChange} />
                    <br />
                    <label>
                        Access Token:
                    </label>
                    <br />

                    <input type="text" value={accessToken} onChange={handleAccessTokenChange} />
                    <button type="submit">Login</button>
                </form>
            </div >
            <Box sx={{ 'height': '600px', 'width': '90%', 'display': 'flex', 'flexDirection': 'column' }}>
                <h1>chat timeline</h1>
                <h2>{Matrix.client?.getRoom(roomId)?.name ?? ''}</h2>
                <Box sx={{ 'flex': '1', 'overflowY': 'auto' }}>
                    <ChatTimeline roomId={roomId} onEditMessage={onEdit} onReplyMessage={onReply} />
                </Box>
                <Box sx={{ 'display': 'flex', 'alignItems': 'flex-start', 'flexDirection': 'column' }}>
                    <Box>
                        {editMessage && (<><small>Editing message</small> <button onClick={() => { setEditMessage(null); setMessage('') }}>Cancel</button></>)}
                        {replyMessage && (<><small>Replying to message {replyMessage.getContent().body}</small> <button onClick={() => setReplyMessage(null)}>Cancel</button></>)}
                    </Box>
                    <form onSubmit={onSend}>
                        <br />
                        <input type="text" value={message} onChange={handleMessageChange} />
                        <button type="submit">Send</button>
                    </form>
                </Box>
            </Box>
        </div >
    )
}
