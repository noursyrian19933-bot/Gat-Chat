import Sequelize, { DataTypes } from "sequelize";
import mysqlConfig from "../db/configMysql";

import _Users from "./Users";
import _Messages from "./Messages";
import _Rooms from "./Rooms";
import _UserRoom from "./Users_Rooms";

import { designDB } from "../db/createMysqldb";

const sequelize = new Sequelize(mysqlConfig.name, mysqlConfig.user, mysqlConfig.password, {
  host: mysqlConfig.host,
  port: mysqlConfig.port,
  dialect: "mysql",
  define: { freezeTableName: true },
  logging: false,
});

function initModels(sequelize) {
  const User = _Users(sequelize, DataTypes);
  const Message = _Messages(sequelize, DataTypes);
  const Room = _Rooms(sequelize, DataTypes);
  const UserRoom = _UserRoom(sequelize, User, Room);
  // User.belongsToMany(Room, { through: UserRoom, foreignKey: 'userId', otherKey: 'roomId' });
  // Room.belongsToMany(User, { through: UserRoom, foreignKey: 'roomId', otherKey: 'userId' });
  User.hasMany(Message, { foreignKey: "userId" });
  Room.hasMany(Message, { foreignKey: "roomId" }); // foreign key appears in the messages table.
  return {
    User,
    Message,
    Room,
    UserRoom,
  };
}

const { User, Message, Room, UserRoom } = initModels(sequelize);

const initDB = async () => {
  try {
    await designDB();
    await sequelize.authenticate();
    await sequelize.sync({ force: false });
    console.log("Mysql DB successfully connected.");
    // create the "welcome" room.
    const welcomeRoomCreated = await Room.findOrCreate({
      where: { roomName: "welcome" },
      defaults: { roomName: "welcome" },
    }); // this returns an array with the instance and a boolean that indicates if it was created or not.
    welcomeRoomCreated && console.log("Welcome room created successfully");
  } catch (error) {
    console.log(error.message);
    console.log("There was an error connecting with the database");
    process.exit(1);
  }
};

export { User, Message, Room, UserRoom, initDB as default };
