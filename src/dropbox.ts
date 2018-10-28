import { Dropbox, DropboxOptions } from "dropbox"
import fetch from "isomorphic-fetch"
import { dropboxAccessToken } from "./secrets.json"
import { SlackMessage, translateMentions } from "./slack"

export const saveMessage = async (message: SlackMessage) => {
    // TODO: DropboxOptions lacks the `fetch` property.  Has the type mistaken?
    /* tslint:disable:no-object-literal-type-assertion */
    const dropbox = new Dropbox({
        accessToken: dropboxAccessToken,
        fetch,
    } as DropboxOptions)
    /* tslint:enable:no-object-literal-type-assertion */
    const translated = await translateMentions(message.text)
    const filename = translated
        .substring(0, 100)
        .replace(/[\\\/]/g, ":")
        .replace(/\s/g, "-")
    console.log("created", filename)
    return dropbox.filesUpload({
        contents: message.ts,
        path: `/${filename}.txt`,
    })
}
