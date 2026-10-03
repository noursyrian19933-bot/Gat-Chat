export default (sequelize, DataTypes) => {
  const User = sequelize.define('users', {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userName: {
      type: DataTypes.STRING,
      unique: true
    },
    password: DataTypes.STRING
  },
    {
      timestamps: false
    }
  );

  User.associate = (models) => {
    User.hasMany(models.Message, {
      onDelete: 'cascade',
    });
  };

  return User;
}