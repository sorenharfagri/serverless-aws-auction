import jwt from 'jsonwebtoken';

// Изначально, API Gateway авторизация кешируется (TTL) на 300 секунд
// Эта policy авторизует все запросы к одному и тому-же инстансу API Gateway от пользователя

const generatePolicy = (principalId: string, methodArn: string) => {
  const apiGatewayWildcard = methodArn.split('/', 2).join('/') + '/*';

  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: apiGatewayWildcard,
        },
      ],
    },
  };
};

/*
  Authorizer
  Пользователь автризируется через auth0, получая token
  Данный handler занимается верификацией токена
*/

export const handler = async (event, context) => {
  if (!event.authorizationToken) {
    throw 'Unauthorized';
  }

  const token = event.authorizationToken.replace('Bearer ', '');

  try {
    const claims = jwt.verify(token, process.env.AUTH0_PUBLIC_KEY);
    // Зашиваем данные пользователя из JWT в контекст запроса
    const policy = generatePolicy(claims.sub, event.methodArn);

    return {
      ...policy,
      context: claims
    };
  } catch (error) {
    console.log(error);
    throw 'Unauthorized';
  }
};
