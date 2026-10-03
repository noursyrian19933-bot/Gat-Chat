import path from 'path';
import dotenv from 'dotenv';

// Parsing the env file.
dotenv.config({ path: path.resolve(__dirname, '../config/config.env') });

// Interface to load env variables
// Note these variables can possibly be undefined
// as someone could skip these varibales or not setup a .env file at all

interface ENV {
  PORT: number | undefined;
  SECRET: string | undefined;
  DB: string | undefined;
  MYSQL_PWD: string | undefined;
  MYSQL_USER: string | undefined;
  MYSQL_NAME: string | undefined;
  MYSQL_HOST: string | undefined;
}

interface Config {
  PORT: number;
  SECRET: string;
  DB: string;
  MYSQL_PWD: string;
  MYSQL_USER: string;
  MYSQL_NAME: string;
  MYSQL_HOST: string;
}

// Loading process.env as ENV interface

const getConfig = (): ENV => {
  return {
    PORT: process.env.PORT ? Number(process.env.PORT) : undefined,
    SECRET: process.env.SECRET ? process.env.SECRET : undefined,
    DB: process.env.DB,
    MYSQL_PWD: process.env.MYSQL_PWD ? process.env.MYSQL_PWD : undefined,
    MYSQL_USER: process.env.MYSQL_USER ? process.env.MYSQL_USER : undefined,
    MYSQL_NAME: process.env.MYSQL_NAME,
    MYSQL_HOST: process.env.MYSQL_HOST,
  };
};

const getSanitzedConfig = (config: ENV): Config => {
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) {
      throw new Error(`Missing key ${key} in config.env`);
    }
  }
  return config as Config;
};
/* If any field is undefined, we don't want our app to run if it can't connect to DB and ensure that these fields are accessible.
If all is OK, return it as Config which just removes the undefined from the type definition. */

const config = getConfig();

const sanitizedConfig = getSanitzedConfig(config);

export default sanitizedConfig;
