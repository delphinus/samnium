import { createHmac } from "crypto"
import { Request, Response } from "express"
import { slackSigningSecret } from "./secrets.json"

export interface Message {
    type: string
    user: string
    ts: string
    text: string
}

export const parseMessage = (req: Request) => {
    mustAuth(req)
    const decoded = JSON.parse(req.body.payload)
    if (isMessage(decoded.message)) {
        return decoded.message
    }
    throw new Error("invalid payload")
}

const mustAuth = (req: Request) => {
    const timestamp = getTimestamp(req)
    const sigBase = `v0:${timestamp}:${req.body}`
    const hash = createHmac("sha256", slackSigningSecret)
        .update(sigBase)
        .digest("hex")
    if (req.header("X-Slack-Signature") === `v0=${hash}`) {
        return
    }
    throw new Error("invalid signature")
}

const getTimestamp = (req: Request) => {
    const timestamp = parseInt(
        req.header("X-Slack-Request-Timestamp") || "",
        10,
    )
    if (Math.abs(timestamp - Date.now()) < 5 * 60) {
        throw new Error("invalid timestamp")
    }
    return timestamp
}

const isMessage = (value: any): value is Message => {
    const isMessageObject = (val: Partial<Message>): val is Message =>
        val.type === "message" &&
        typeof val.user === "string" &&
        typeof val.ts === "string" &&
        /^\d+\.\d+$/.test(val.ts) &&
        typeof val.text === "string"
    return isObject(value) && isMessageObject(value)
}

const isObject = (value: any): value is object =>
    value !== null && value !== undefined && Object(value) === value
