// Testing

export async function handler(event, context) {
  return {
    statusCode: 200,
    headers: {
      /* Поддержка CORS */
      'Access-Control-Allow-Origin': '*',
      /* Поддержка куки, авторизационных заголовков через HTTPS */
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      event,
      context
    }),
  };
}
