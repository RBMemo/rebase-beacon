const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");
const { logger } = require("./logger");

const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;
const client = new SQSClient({ region: 'us-west-2' });

async function sendMessage(message) {
  message = JSON.stringify(message);
  
  logger.info(`[SQS] sending message=${message}`)

  const command = new SendMessageCommand({
    MessageBody: message,
    QueueUrl: SQS_QUEUE_URL
  });
  const res = await client.send(command);

  logger.info(`[SQS] responseCode=${res.$metadata.httpStatusCode} messageId=${res.MessageId}`);

  return res;
}

module.exports = { sendMessage };
