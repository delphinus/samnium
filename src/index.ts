import { Request, Response } from "express"
import { parseMessage } from "./slack"

export const samnium = (req: Request, res: Response) => {
    switch (req.method) {
        case "POST":
            try {
                process(req, res)
            } catch (err) {
                res.status(500).send(err)
            }
            break
        default:
            res.status(405).send("Method Not Allowed")
            break
    }
}

const process = (req: Request, res: Response) => {
    const message = parseMessage(req)
}
