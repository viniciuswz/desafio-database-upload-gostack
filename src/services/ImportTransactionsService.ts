import csv from 'csv-parse';
import { response } from 'express';
import fs from 'fs';
import Transaction from '../models/Transaction';

import CreateTransactionService from './CreateTransactionService';

interface Request {
  files: Express.Multer.File[];
}

interface TransactionsFile {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class ImportTransactionsService {
  async execute({ files }: Request): Promise<Transaction[]> {
    const createTransactionService = new CreateTransactionService();
    const transactions: TransactionsFile[] = [];
    const transactionsProcessed: Transaction[] = [];

      const readFiles = await Promise.all(files.map(async item =>
        await new Promise (resolve =>{
          fs.createReadStream(item.path)
          .pipe(csv({ from_line: 2 }))
          .on('data', async data => {
            // console.log(data)
            const [title, type, value, category] = data;
            const transaction = {
              title: title.trim(),
              type: type.trim(),
              value: Number(value.trim()),
              category: category.trim(),
            };
             transactions.push(transaction);
            // console.log(transactions);
          }).on('end', async () => {
              return resolve();
            });
        })
      ));


    const promiseDone = await Promise.all(transactions.map(async item => {
        console.log('after');
        const response = await new Promise<Transaction>(resolve => resolve(createTransactionService.execute(item)))
        console.log('before');
        return response;

      })
    );
    console.log('----------------promiseDone',promiseDone);


    return promiseDone;
  }
}

export default ImportTransactionsService;
