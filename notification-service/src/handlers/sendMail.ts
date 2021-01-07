import { SES } from 'aws-sdk'
import 'source-map-support/register';
import { SQSHandler, SQSEvent, SQSRecord } from 'aws-lambda'

const ses = new SES({ region: 'eu-west-1' });

/*
  Ожидаемое SQS сообщение
*/
interface Mail {
  subject: string
  recipient: string
  body: string
}

/*
  Отправка email уведомления через SES
*/

const sendMail: SQSHandler = async (event: SQSEvent) => {
  const record: SQSRecord = event.Records[0];
  console.log(`Record proceessing`, record)

  const email: Mail = JSON.parse(record.body);
  const { subject, body, recipient } = email;

  const params: SES.SendEmailRequest = {
    Source: 'sorenharfagri@gmail.com',
    Destination: {
      ToAddresses: [recipient],
    },
    Message: {
      Body: {
        Text: {
          Data: body
        }
      },
      Subject: {
        Data: subject
      }
    },
  }

  try {
    await ses.sendEmail(params).promise()
    // const result = ses.sendEmail(params).promise()
    // return result;
  } catch (e) {
    console.log(e)
  }
}

export const handler = sendMail