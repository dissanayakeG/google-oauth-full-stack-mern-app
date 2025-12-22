import { up } from '../../migrations/20251222052742-create-user';
import sequelize from './db.config';

async function migrate() {
  const qi = sequelize.getQueryInterface();
  await up(qi);
  process.exit(0);
}

migrate();
