// import AppError from '../errors/AppError';

import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';

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
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(Transaction);
    // TODO
  }
}

export default CreateTransactionService;
