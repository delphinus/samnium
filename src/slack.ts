import { createHmac } from "crypto"
import { Request, Response } from "express"
import fetch from "isomorphic-fetch"
import { slackAccessToken, slackSigningSecret } from "./secrets.json"

interface SlackRequest {
    response_url: string
    message: SlackMessage
}

export interface SlackMessage {
    type: string
    user: string
    ts: string
    text: string
}

export const parseRequest = (req: Request) => {
    if (!hasRawBody(req)) {
        throw new Error("this request has no raw body")
    }
    mustAuth(req)
    const decoded = JSON.parse(req.body.payload)
    if (isSlackRequest(decoded)) {
        return decoded
    }
    throw new Error("invalid payload")
}

export const responseToChannel = async (slackReq: SlackRequest) =>
    fetch(slackReq.response_url, {
        body: JSON.stringify({
            response_type: "ephemeral",
            text: "Successfully added the text to iOS Reminders",
        }),
        headers: {
            Authorization: `Bearer ${slackAccessToken}`,
            "Content-Type": "application/json",
        },
        method: "POST",
    })

const mustAuth = (req: ReqWithRawBody) => {
    const timestamp = getTimestamp(req)
    const sigBase = `v0:${timestamp}:${req.rawBody.toString("utf-8")}`
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

const isSlackRequest = (value: any): value is SlackRequest => {
    const isSlack = (val: Partial<SlackRequest>): val is SlackRequest =>
        typeof val.response_url === "string" && isMessage(value.message)
    return isObject(value) && isSlack(value)
}

const isMessage = (value: any): value is SlackMessage => {
    const isMessageObject = (val: Partial<SlackMessage>): val is SlackMessage =>
        val.type === "message" &&
        typeof val.user === "string" &&
        typeof val.ts === "string" &&
        /^\d+\.\d+$/.test(val.ts) &&
        typeof val.text === "string"
    return isObject(value) && isMessageObject(value)
}

const isObject = (value: any): value is object =>
    value !== null && value !== undefined && Object(value) === value

interface ReqWithRawBody extends Request {
    rawBody: Buffer
}

const hasRawBody = (req: Request): req is ReqWithRawBody =>
    Buffer.isBuffer((req as any).rawBody)
