import { getCustomRepository } from 'typeorm';
import Category from '../models/Category';
import CategoriesRepository from '../repositories/CategoriesRepository';

class HandleImportedCategoriesService {
  public async execute(categoriesImported: string[]): Promise<void> {
    const categories = categoriesImported.filter(
      (value, index, self) => self.indexOf(value) === index,
    );

    const categoriesRepository = getCustomRepository(CategoriesRepository);
    const dbCategories = await categoriesRepository.findCategories(categories);

    let categoriesToAdd = categories;
    if (dbCategories.length > 0) {
      categoriesToAdd = categories.filter(
        category => !dbCategories.map(item => item.title).includes(category),
      );
    }

    const categoriesPromises = Array<Promise<Category>>();
    categoriesToAdd.forEach(category => {
      categoriesPromises.push(categoriesRepository.createCategory(category));
    });

    await Promise.all(categoriesPromises);
  }
}

export default HandleImportedCategoriesService;
