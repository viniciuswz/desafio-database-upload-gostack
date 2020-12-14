import csv from 'csv-parse';
import fs from 'fs';
import { getCustomRepository, getRepository } from 'typeorm';
import Transaction from '../models/Transaction';

import TransactionRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  files: Express.Multer.File[];
}

interface TransactionsFile {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string | Category;
}
class ImportTransactionsService {
  async execute({ files }: Request): Promise<Transaction[]> {
    // const createTransactionService = new CreateTransactionService();
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    const transactions: TransactionsFile[] = [];

    await Promise.all(
      files.map(
        async item =>
          new Promise<void>(resolve => {
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
              })
              .on('end', async () => {
                return resolve();
              });
          }),
      ),
    );

    const promiseDone = await Promise.all(
      transactions.map(async item => {
        let categoryResponse = await categoryRepository.findOne({
          where: { title: item.category },
        });

        if (categoryResponse === undefined) {
          const categoryTitle = item.category as string;
          const categoryData = await categoryRepository.save({
            title: categoryTitle,
          });
          categoryResponse = await categoryRepository.save(categoryData);
        }

        const transactionItem = transactionRepository.create({
          category: categoryResponse,
          title: item.title,
          type: item.type,
          value: item.value,
        });

        return transactionItem;
      }),
    );

    const resposeTransactions = await transactionRepository.save(promiseDone);

    return resposeTransactions;
  }
}

export default ImportTransactionsService;
