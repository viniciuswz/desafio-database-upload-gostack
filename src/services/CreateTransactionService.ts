import AppError from '../errors/AppError';

import { getCustomRepository, getRepository, TransactionRepository } from 'typeorm';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    category,
    title,
    type,
    value,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);
    let newCategory;

    const { total } = await transactionsRepository.getBalance();

    if(type == 'outcome' && total < value){
      throw new AppError('Can not create a transaction with a invalid balance',400);
    }
    const categoryResponse = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (categoryResponse === undefined) {
      const categorySchema = categoryRepository.create({ title: category });
      newCategory = await categoryRepository.save(categorySchema);
    }

    const categoryData =
      newCategory === undefined ? categoryResponse : newCategory;
    // const { id } = categoryData as Category;

    const transactionData = transactionsRepository.create({
      category: categoryData,
      title,
      type,
      value,
    });

    const transaction = await transactionsRepository.save(transactionData);

    return transaction;
    // TODO
  }
}

export default CreateTransactionService;
