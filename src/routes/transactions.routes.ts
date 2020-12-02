import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import multer from 'multer';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import uploadConfig from '../config/upload';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionsRepository.find({
    relations: ['category'],
  });
  const balance = await transactionsRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransactionService = new CreateTransactionService();

  const transaction = await createTransactionService.execute({
    category,
    title,
    type,
    value,
  });

  return response.status(201).json(transaction);

  // TODO
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransactionService = new DeleteTransactionService();
  await deleteTransactionService.execute({ id });
  console.log('banido');
  return response.status(204).json();
  // TODO
});

transactionsRouter.post(
  '/import',
  upload.array('file'),
  async (request, response) => {
    const importTransactionsService = new ImportTransactionsService();
    const { files } = request;

    const filesArr = files as Express.Multer.File[];

    const transactions = await importTransactionsService.execute({
      files: filesArr,
    });
    return response.json(transactions);
  },
);

export default transactionsRouter;
