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
    console.log('1');

      // new Promise(resolve =>{
      //   return resolve();
      // });
      const readFiles = await Promise.all(files.map(async item =>
        new Promise (resolve =>{
          fs.createReadStream(item.path)
          .pipe(csv({ from_line: 2 }))
          .on('data', async data => {
            const [title, type, value, category] = data;
            const transaction = {
              title: title.trim(),
              type: type.trim(),
              value: value.trim(),
              category: category.trim(),
            };
            // console.log(transaction)
            resolve(transactions.push(transaction));
          })
        })
      ))



    // .on('end', async () => {
    //   return resolve;
    // });
      console.log('123123',readFiles)
    console.log('2', transactions);

    console.log('3');
    //await transactions.forEach(async transaction => {
      //console.log('jaca', transaction);
      // const response = await createTransactionService.execute(
      //   transaction,
      // );
      // transactionsProcessed.push(response);
    //});
    // const response = await createTransactionService.execute(transaction);
    return transactionsProcessed;
  }
}

export default ImportTransactionsService;
