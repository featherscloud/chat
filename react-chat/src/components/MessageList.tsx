import {useCallback, useEffect, useRef} from "react"
import { Message as MessageType, User } from "../utils"
import {useChat} from "./ChatContext.tsx";

type MessageListProps = {
  users: User[];
  messages: MessageType[];
}

const formatDate = (timestamp: number) =>
  new Intl.DateTimeFormat('en-US', {
    timeStyle: 'short',
    dateStyle: 'medium'
  }).format(new Date(timestamp))

const Message= ({message, author }: {message: MessageType; author?: User;}) => {
  const {user, handle} = useChat();
  const reactToMessage = useCallback(() => {
    handle?.change((chat)=>{
      const writeableMessage = chat.messages.find(({id})=>id===message.id);
      if(writeableMessage){
        writeableMessage.reactions ??= {};
        writeableMessage.reactions['✨'] ??= {};
        writeableMessage.reactions['✨'][user!.id] = true;
      }
    });
  }, [handle, message, user]);
  const reactions = Object.entries(message.reactions??{}).reduce((acc: Record<string, number>, [emoji, peanutGallery])=>{
    acc[emoji] = Object.keys(peanutGallery).length;
    return acc;
  }, {});
  return <div className="chat chat-start py-2" key={message.id}>
    <div className="chat-image avatar">
      <div className="w-10 rounded-full">
        <img src={author?.avatar}/>
      </div>
    </div>
    <div className="chat-header pb-1">
      {author?.username}
      <time className="text-xs opacity-50">{formatDate(message.createdAt)}</time>
    </div>
    <div className="chat-bubble">{message.text}</div>
    <div className='reactions'>
      {Object.entries(reactions).map(([emoji, total])=><span key={emoji}>
          <span>{emoji}</span>
          <span>{total}</span>
        </span>)}
      <button onClick={reactToMessage}>+</button>
    </div>
  </div>;
}

export const MessageList = ({messages, users}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const usersById = users.reduce((acc, user) => {
    acc[user.id] = user
    return acc
  }, {} as Record<string, User>)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"})
  })

  return <div id="chat" className="h-full overflow-y-auto px-3">
    {messages.map(message => <Message key={message.id} message={message} author={usersById[message.userId]}/>)}
    <div ref={messagesEndRef} />
  </div>
}