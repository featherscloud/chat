import { useEffect, useRef } from "react"
import { Message, User, separateUrls } from "../utils"

type MessageListProps = {
  messages: Message[]
  users: User[]
}

const formatDate = (timestamp: number) =>
  new Intl.DateTimeFormat('en-US', {
    timeStyle: 'short',
    dateStyle: 'medium'
  }).format(new Date(timestamp))

export const MessageList = ({ messages, users }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const usersById = users.reduce((acc, user) => {
    acc[user.id] = user
    return acc
  }, {} as Record<string, User>)

  useEffect(() => {
      (messagesEndRef.current)?.scrollIntoView({ behavior: "auto" });
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    (messagesEndRef.current)?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return <div id="chat" className="h-full overflow-y-auto px-3">
    {messages.map(message => <div className="chat chat-start py-2" key={message.id}>
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <img src={usersById[message.userId]?.avatar} />
        </div>
      </div>
      <div className="chat-header pb-1 space-x-2">
        <span>{usersById[message.userId]?.username}</span>
        <time className="text-xs opacity-50">{formatDate(message.createdAt)}</time>
      </div>
      <div className="chat-bubble break-words">
       {separateUrls(message.text).map((part) =>
           part.type === "link" ? (
             <a key={part.id} href={part.value} rel="noopener noreferrer" target="_blank">
                 {part.value}
               </a>
           ) : (
             part.value
           )
         )}
      </div>
    </div>)}
    <div ref={messagesEndRef} />
  </div>
}
