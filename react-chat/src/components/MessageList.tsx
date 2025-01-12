import { useEffect, useRef, useState } from "react"
import { ChatDocument, Message, User } from "../utils"
import { DocHandle } from "@automerge/automerge-repo"

type MessageListProps = {
  messages: Message[]
  users: User[]
  user: User
  handle: DocHandle<ChatDocument>
}

const formatDate = (timestamp: number) =>
  new Intl.DateTimeFormat('en-US', {
    timeStyle: 'short',
    dateStyle: 'medium'
  }).format(new Date(timestamp))

export const MessageList = ({ messages, users, user, handle }: MessageListProps) => {
  const messagesEndRef = useRef(null)

  // Users mapped by their IDs for easy access
  const usersById = users.reduce((acc, user) => {
    acc[user.id] = user
    return acc
  }, {} as Record<string, User>)



  // Scroll to bottom when messages change
  useEffect(() => {
    (messagesEndRef.current as any)?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function getLikeCount(message: Message): number {
    if (!message.likes) return 0;
    return message.likes.length;
  }


  // Update the message's Like 
  const createLike = (messageId: string) => {
    if (handle && user) {
      handle.change(doc => {
        const msg = doc.messages.find(message => message.id === messageId);
        if (msg) {
          const likeArray = msg.likes || [];
          // check to see if the user has already liked this message
          if (likeArray.includes(user.id)) {
            // Remove the like if the user has already liked the message
            msg.likes = likeArray.filter(like => like !== user.id)
          } else {
            // Add the user to the array of users who have liked this message
            msg.likes = likeArray.concat(user.id);
          }
        }
      })
    }
  }


  return (
    <div id="chat" className="h-full overflow-y-auto px-3">
      {messages.map((message) => {

        return (
          <div className="chat chat-start py-2" key={message.id}>
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
                <img src={usersById[message.userId]?.avatar} alt="avatar" />
              </div>
            </div>
            <div className="chat-header pb-1">
              {usersById[message.userId]?.username}
              <time className="text-xs opacity-50">{formatDate(message.createdAt)}</time>
            </div>
            <div className="chat-bubble">{message.text}</div>
            
            <div className="chat-footer">
              {/* Swap icons based on whether users have liked it or not */}
              <span className="text-xs" onClick={() => createLike(message.id)}>
                {getLikeCount(message) > 0
                  ? <span>❤️ {getLikeCount(message)} Like{getLikeCount(message) > 1 ? 's' : ''}</span>
                  : '🤍'}
              </span>
            </div>
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}
