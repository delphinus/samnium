import { Request, Response } from "express"
import { saveMessage } from "./dropbox"
import { parseRequest, responseToChannel } from "./slack"

export const samnium = async (req: Request, res: Response) => {
    switch (req.method) {
        case "POST":
            try {
                await process(req, res)
            } catch (err) {
                console.error(err)
                res.status(500).send(err)
            }
            break
        default:
            res.status(405).send("Method Not Allowed")
            break
    }
}

const process = async (req: Request, res: Response) => {
    const slackReq = await parseRequest(req)
    await saveMessage(slackReq.message)
    return responseToChannel(slackReq)
}
