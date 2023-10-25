import net from 'node:net';
import { logger } from '../logger';

export const ErrorCodes = {
    211: 'SMTP Error: A system status or help reply.',
    214: 'SMTP Error: Help Message.',
    220: 'SMTP Error: The server is ready.',
    221: 'SMTP Error: The server is ending the conversation.',
    250: 'SMTP Error: The requested action was completed.',
    251: 'SMTP Error: The specified user is not local, but the server will forward the mail message.',
    354: 'SMTP Error: This is a reply to the DATA command. After getting this, start sending the body of the mail message, ending with "\r\n.\r\n."',
    421: 'SMTP Error: The mail server will be shut down. Save the mail message and try again later.',
    450: 'SMTP Error: The mailbox that you are trying to reach is busy. Wait a little while and try again.',
    451: 'SMTP Error: The requested action was not done. Some error occurmiles in the mail server.',
    452: 'SMTP Error: The requested action was not done. The mail server ran out of system storage.',
    500: 'SMTP Error: The last command contained a syntax error or the command line was too long.',
    501: 'SMTP Error: The parameters or arguments in the last command contained a syntax error.',
    502: 'SMTP Error: The mail server has not implemented the last command.',
    503: 'SMTP Error: The last command was sent out of sequence. For example, you might have sent DATA before sending RECV.',
    504: 'SMTP Error: One of the parameters of the last command has not been implemented by the server.',
    550: "SMTP Error: The mailbox that you are trying to reach can't be found or you don't have access rights.",
    551: 'SMTP Error: The specified user is not local; part of the text of the message will contain a forwarding address.',
    552: 'SMTP Error: The mailbox that you are trying to reach has run out of space. Store the message and try again tomorrow or in a few days-after the user gets a chance to delete some messages.',
    553: 'SMTP Error: The mail address that you specified was not syntactically correct.',
    554: 'SMTP Error: The mail transaction has failed for unknown causes.',
}

export const hasCode = (message: Buffer, code: keyof typeof ErrorCodes): boolean => {
    return message.indexOf(`${code}`) === 0 || message.indexOf(`${code}\n`) > -1
}

// 5 seconds
const TIMEOUT = 1000 * 5;

export const checkSMTP = async (sender: string, recipient: string, exchange: string): Promise<void> => {
    return new Promise<void>((ok, rej) => {
        let receivedData = false
        let closed = false
        const socket = net.createConnection(25, exchange)
        socket.setEncoding('ascii')
        socket.setTimeout(TIMEOUT);
        socket.on('error', error => {
            logger.error(error)
            socket.emit('fail', error)
        })
        socket.on('close', hadError => {
            if (!receivedData && !hadError) {
                socket.emit('fail', 'Mail server closed connection without sending any data.')
            }
            if (!closed) {
                socket.emit('fail', 'Mail server closed connection unexpectedly.')
            }
        })
        socket.once('fail', msg => {
            closed = true
            rej(new Error(msg as string));
            if (socket.writable && !socket.destroyed) {
                socket.write(`quit\r\n`)
                socket.end()
                socket.destroy()
            }
        })

        socket.on('success', () => {
            closed = true
            if (socket.writable && !socket.destroyed) {
                socket.write(`quit\r\n`)
                socket.end()
                socket.destroy()
            }
            ok();
        })

        const commands = [`helo ${exchange}\r\n`, `mail from: <${sender}>\r\n`, `rcpt to: <${recipient}>\r\n`]
        let i = 0
        socket.on('next', () => {
            if (i < 3) {
                if (socket.writable) {
                    socket.write(commands[i++]!)
                } else {
                    socket.emit('fail', 'SMTP communication unexpectedly closed.')
                }
            } else {
                socket.emit('success')
            }
        })

        socket.on('timeout', () => {
            socket.emit('fail', 'Timeout')
        })

        socket.on('connect', () => {
            socket.on('data', msg => {
                receivedData = true
                logger.info(msg)
                if (hasCode(msg, 220) || hasCode(msg, 250)) {
                    socket.emit('next', msg)
                } else if (hasCode(msg, 550)) {
                    socket.emit('fail', 'Mailbox not found.')
                } else {
                    const [code] = Object.keys(ErrorCodes).filter(x => hasCode(msg, x as never as keyof typeof ErrorCodes)) as never as [keyof typeof ErrorCodes];
                    socket.emit('fail', ErrorCodes[code] || 'Unrecognized SMTP response.')
                }
            })
        })
    })
}

