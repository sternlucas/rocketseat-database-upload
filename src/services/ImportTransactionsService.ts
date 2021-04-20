import fs from 'fs';
import cvsParse from 'csv-parse';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface FileType {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  public async execute(filePath: string): Promise<Transaction[]> {
    const transactionsImported = await this.getImportedTransactions(filePath);

    const createTransactionService = new CreateTransactionService();

    const transactionsPromises = Array<Promise<Transaction>>();
    transactionsImported.forEach(transaction => {
      const { title, value, type, category } = transaction;
      transactionsPromises.push(
        createTransactionService.execute({
          title,
          value,
          type,
          categoryTitle: category,
        }),
      );
    });

    const transactions = Array<Transaction>();

    // transactionsPromises.reduce((prev: Promise, task: Promise) => {
    //   return prev.then(task);
    // }, Promise.resolve());

    // transactionsPromises.forEach(promise => {
    //   const transaction = Promise.resolve(promise);
    //   transactions.push(transaction);
    // });

    return transactions;
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
}

export default ImportTransactionsService;
