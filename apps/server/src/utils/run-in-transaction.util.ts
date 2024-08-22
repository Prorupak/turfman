import { Connection, ClientSession } from 'mongoose';

export async function runInTransaction<T>(
  connection: Connection,
  operation: (session: ClientSession) => Promise<T>,
  options: {
    retries?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {},
): Promise<T> {
  const session = await connection.startSession();
  session.startTransaction();
  const { retries = 0, onRetry } = options;

  try {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await operation(session);
        await session.commitTransaction();
        return result;
      } catch (error) {
        if (attempt < retries) {
          if (onRetry) onRetry(attempt + 1, error);
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
