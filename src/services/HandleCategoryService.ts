import { getCustomRepository } from 'typeorm';
import Category from '../models/Category';
import CategoriesRepository from '../repositories/CategoriesRepository';

class HandleCategoryService {
  public async execute(title: string): Promise<Category> {
    const categoriesRepository = getCustomRepository(CategoriesRepository);

    const findCategory = await categoriesRepository.findByTitle(title);

    if (findCategory) {
      return findCategory;
    }

    const category = await categoriesRepository.createCategory(title);

    return category;
  }
}

export default HandleCategoryService;
