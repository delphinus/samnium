import { Dropbox, DropboxOptions } from "dropbox"
import fetch from "isomorphic-fetch"
import { dropboxAccessToken } from "./secrets.json"
import { SlackMessage } from "./slack"

export const saveMessage = async (message: SlackMessage) => {
    // TODO: DropboxOptions lacks the `fetch` property.  Has the type mistaken?
    /* tslint:disable:no-object-literal-type-assertion */
    const dropbox = new Dropbox({
        accessToken: dropboxAccessToken,
        fetch,
    } as DropboxOptions)
    /* tslint:enable:no-object-literal-type-assertion */
    return dropbox.filesUpload({
        contents: message.ts,
        path: `/${message.text.substring(0, 100).replace(/\s/g, "-")}.txt`,
    })
}
