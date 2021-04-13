import { EntityRepository, Repository } from 'typeorm';
import Category from '../models/Category';

@EntityRepository(Category)
class CategoriesRepository extends Repository<Category> {
  public async findByTitle(title: string): Promise<Category | null> {
    const category = await this.findOne({ where: { title } });

    return category || null;
  }

  public async createCategory(title: string): Promise<Category> {
    const category = this.create({ title });

    await this.save(category);

    return category;
  }
}

export default CategoriesRepository;
