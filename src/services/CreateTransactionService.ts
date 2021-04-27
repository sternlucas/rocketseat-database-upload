// import AppError from '../errors/AppError';

import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import GetTransactionsService from './GetTransactionsService';
import HandleCategoryService from './HandleCategoryService';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  categoryTitle: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    categoryTitle,
  }: Request): Promise<Transaction> {
    const getTransactionsService = new GetTransactionsService();

    const transactions = await getTransactionsService.execute();

    if (type === 'outcome' && value > transactions.balance.total) {
      throw new AppError(
        'Not be able to create outcome transaction without a valid balance',
      );
    }

    const handleCategory = new HandleCategoryService();
    const category = await handleCategory.execute(categoryTitle);

    const transactionRepository = getCustomRepository(TransactionsRepository);

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category,
    });

    return transactionRepository.save(transaction);
  }
}

export default CreateTransactionService;
