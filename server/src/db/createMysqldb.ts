import { createConnection, Connection } from 'mysql2/promise';
import mysqlConfig from './configMysql';

export async function designDB(): Promise<void> {
  try {
    const dbcnx: Connection = await createConnection({
      host: mysqlConfig.host,
      user: mysqlConfig.user,
      port: mysqlConfig.port,
      password: mysqlConfig.password,
    });
    await dbcnx.query(`CREATE DATABASE IF NOT EXISTS \`${mysqlConfig.name}\``);
    console.log('Database created');
  } catch (error) {
    if (error instanceof Error) console.log('Error connecting or creating database: ' + error.message);
  }
}
