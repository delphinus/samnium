import { Dropbox } from "dropbox"
import { dropboxAccessToken } from "./secrets.json"
import { SlackMessage } from "./slack"

export const saveMessage = async (message: SlackMessage) => {
    const dropbox = new Dropbox({ accessToken: dropboxAccessToken })
    return dropbox.filesUpload({
        contents: message.ts,
        path: `/${message.text.substring(0, 100).replace(/\s/g, "-")}.txt`,
    })
}
