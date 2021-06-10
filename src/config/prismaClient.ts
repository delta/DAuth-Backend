import { PrismaClient } from '@prisma/client';
// TODO: configure logging
// https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/logging
const prisma = new PrismaClient({
  log: ['query', 'info', `warn`, `error`]
});

export default prisma;
