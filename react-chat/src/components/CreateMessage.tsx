import { useState } from "react"

type CreateMessageOptions = {
  onSubmit: (text: string) => void
}

export const CreateMessage = ({ onSubmit }: CreateMessageOptions) => {
  const [text, setText] = useState('')
  const handleSubmit = async () => {
    if (text === "") return;

    onSubmit(text)
    setText('')
  }

  return <form className="input-group overflow-hidden" id="send-message" onSubmit={ev => {
    ev.preventDefault()
    handleSubmit()
  }}>
    <input name="text" type="text" value={text} onChange={ev => setText(ev.target.value)}
      placeholder="Compose message" className="input input-bordered w-full" />
    <button type="submit" className="btn">Send</button>
  </form>
}
