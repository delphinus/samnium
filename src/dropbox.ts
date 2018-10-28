import { Dropbox } from "dropbox"
import { dropboxAccessToken } from "./secrets.json"
import { Message } from "./slack"

const saveMessage = async (message: Message) => {
    const dropbox = new Dropbox({ accessToken: dropboxAccessToken })
    return dropbox.filesUpload({
        contents: message.text,
        path: `/${message.ts}.txt`,
    })
}
