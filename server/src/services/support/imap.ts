const ImapFlowClient = async (accessToken: string, userEmail: string) => {
  const { ImapFlow } = await import('imapflow');
  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: userEmail,
      accessToken: accessToken,
    },
    // logger: {
    //     debug: (obj: any) => logger.debug('IMAP DEBUG:', obj),
    //     info: (obj: any) => logger.info({ obj }, 'IMAP INFO:'),
    //     warn: (obj: any) => logger.warn({ obj }, 'IMAP WARN:'),
    //     error: (obj: any) => logger.error('IMAP ERROR:', obj)
    // }
  });

  return client;
};

export default ImapFlowClient;
