import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface GetTransactionsServiceResponse {
  transactions: Transaction[];
  balance: Balance;
}

class GetTransactionsService {
  public async execute(): Promise<GetTransactionsServiceResponse> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const transactions = await transactionsRepository.getAll();

    const balance = transactionsRepository.getBalance(transactions);

    return {
      transactions,
      balance,
    };
  }
}
export default GetTransactionsService;
