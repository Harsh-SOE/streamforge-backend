export const PrismaClientMock = () => ({
  client: {
    user: {
      create: jest.fn(),
      createMany: jest.fn().mockResolvedValue({ count: 1 }),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
});
