import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const orderModel = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    items: {
        type: DataTypes.JSON,
        allowNull: false
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    address: {
        type: DataTypes.JSON,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: "Food Processing"
    },
    payment: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'orders',
    timestamps: true
});

export default orderModel;
