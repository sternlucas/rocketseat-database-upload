import { EntityRepository, In, Repository } from 'typeorm';
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

  public async findCategories(titles: string[]): Promise<Category[]> {
    const categories = await this.find({
      where: { title: In(titles) },
      select: ['title'],
    });

    return categories;
  }
}

export default CategoriesRepository;
