export default (sequelize, DataTypes) => {
    const Room = sequelize.define('rooms', {
        roomId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        roomName: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            collate: 'utf8_bin'
        },
        isPrivate: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    },
        {
            timestamps: false
        }
    );
    Room.associate = (models) => {
        Room.hasMany(models.Message, {
            onDelete: 'cascade',
        });
    }

    return Room
}
