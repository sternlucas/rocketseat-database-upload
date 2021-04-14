import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getAll(): Promise<Transaction[]> {
    const transactions = await this.find();

    return transactions;
  }

  public getBalance(transacations: Transaction[]): Balance {
    const { income, outcome } = transacations.reduce(
      (accumulator: Omit<Balance, 'total'>, transaction: Transaction) => {
        switch (transaction.type) {
          case 'income':
            accumulator.income += Number(transaction.value);
            break;
          case 'outcome':
            accumulator.outcome += Number(transaction.value);
            break;
          default:
            break;
        }

        return accumulator;
      },
      {
        income: 0,
        outcome: 0,
      },
    );

    return { income, outcome, total: income - outcome };
  }
}

export default TransactionsRepository;
