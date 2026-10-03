export default (sequelize, DataTypes, User, Room) => {
  const Message = sequelize.define('messages', {
    messageId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    message: {
      type: DataTypes.STRING
    },
    // I prefer to manually specify the createdAt field.
    createdAt: {
      type: DataTypes.STRING,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  },
    {
      timestamps: false,
    }
  )

  Message.associate = (models) => {
    Message.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
    });

    Message.belongsTo(models.Room, {
      foreignKey: 'roomId',
      onDelete: 'CASCADE',
    });
  }
  return Message
}