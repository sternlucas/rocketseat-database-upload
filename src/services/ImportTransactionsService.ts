import fs from 'fs';
import cvsParse from 'csv-parse';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';
import HandleImportedCategoriesService from './HandleImportedCategoriesService';
import AppError from '../errors/AppError';

interface FileType {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

class ImportTransactionsService {
  public async execute(filePath: string): Promise<Transaction[]> {
    const transactionsImported = await this.getImportedTransactions(filePath);

    this.checkTransactionsValues(transactionsImported);

    // Get categories
    const categories = transactionsImported.map(
      transaction => transaction.category,
    );

    const handleCategories = new HandleImportedCategoriesService();
    await handleCategories.execute(categories);

    // Create imported transactions
    const incomeTransactionsPromises = this.getTransactionPromise(
      transactionsImported,
      'income',
    );
    const incomeTransactions = await Promise.all(incomeTransactionsPromises);

    const outcomeTransactionsPromises = this.getTransactionPromise(
      transactionsImported,
      'outcome',
    );
    const outcomeTransactions = await Promise.all(outcomeTransactionsPromises);

    return incomeTransactions.concat(outcomeTransactions);
  }

  private async getImportedTransactions(filePath: string): Promise<FileType[]> {
    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = cvsParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines = Array<FileType>();

    parseCSV.on('data', line => {
      lines.push({
        title: line[0],
        type: line[1],
        value: line[2],
        category: line[3],
      });
    });

    await new Promise(resolve => {
      parseCSV.on('end', () => {
        console.log('Leitura do CSV finalizada');
        resolve(null);
      });
    });

    fs.unlink(filePath, err => {
      if (err) {
        console.log(err);
      }
    });

    return lines;
  }

  private checkTransactionsValues(transactionsImported: FileType[]): void {
    const { income, outcome } = transactionsImported.reduce(
      (accumulator: Omit<Balance, 'total'>, transaction: FileType) => {
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
      { income: 0, outcome: 0 },
    );

    if (income < outcome) {
      throw new AppError(
        'Not be able to create outcome transaction without a valid balance',
      );
    }
  }

  private getTransactionPromise(
    transactionsImported: FileType[],
    transactionType: string,
  ): Array<Promise<Transaction>> {
    const createTransactionService = new CreateTransactionService();

    const promises = Array<Promise<Transaction>>();

    transactionsImported
      .filter(transaction => transaction.type === transactionType)
      .forEach(transaction => {
        const { title, value, type, category } = transaction;
        promises.push(
          createTransactionService.execute({
            title,
            value,
            type,
            categoryTitle: category,
          }),
        );
      });

    return promises;
  }
}

export default ImportTransactionsService;
