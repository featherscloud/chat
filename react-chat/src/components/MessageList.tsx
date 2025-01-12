import {useCallback, useEffect, useRef, MouseEvent} from "react"
import {Message as MessageType, User} from "../utils"
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

const Reaction = ({emoji, total, onClick}: { emoji: string, total: number, onClick: (event: MouseEvent) => void }) => {
  return <button className='reaction' onClick={onClick} data-emoji={emoji}>
    <span>{emoji}</span>
    <span>{total}</span>
  </button>;
}

const Message = ({message, author}: { message: MessageType; author?: User; }) => {
  const {user, handle} = useChat();
  const handleAddReactClick = useCallback(() => {
    handle?.change((chat) => {
      const writeableMessage = chat.messages.find(({id}) => id === message.id);
      if (writeableMessage) {
        writeableMessage.reactions ??= {};
        writeableMessage.reactions['✨'] ??= {};
        writeableMessage.reactions['✨'][user!.id] = true;
      }
    });
  }, [handle, message, user]);
  const handleRemoveReactClick = useCallback((event: MouseEvent) => {
    const emoji = ((event.target as HTMLElement).closest('[data-emoji]') as HTMLButtonElement)?.getAttribute('data-emoji');
    console.log('[handle remove]', emoji);
    if (emoji && handle) {
      handle?.change((chat) => {
        const writeableMessage = chat.messages.find(({id}) => id === message.id);
        if (writeableMessage) {
          writeableMessage.reactions ??= {};
          writeableMessage.reactions[emoji] ??= {};
          delete writeableMessage.reactions[emoji][user!.id];
          if(Object.keys(writeableMessage.reactions[emoji]).length < 1){
            delete writeableMessage.reactions[emoji];
          }
        }
      });
    }
  }, [handle, message, user]);
  const reactions = Object.entries(message.reactions ?? {}).reduce((acc: Record<string, number>, [emoji, peanutGallery]) => {
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
    <div className="chat-bubble relative">
      {message.text}
      <div className='absolute bottom-[-2rem] flex flex-wrap gap-1'>
        {Object.entries(reactions).map(([emoji, total]) => <Reaction key={emoji} emoji={emoji} total={total}
                                                                     onClick={handleRemoveReactClick}/>)}
        {/*TODO(thure): Add emoji picker*/}
        <button className='reaction' onClick={handleAddReactClick}>+</button>
      </div>
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
    <div ref={messagesEndRef}/>
  </div>
}