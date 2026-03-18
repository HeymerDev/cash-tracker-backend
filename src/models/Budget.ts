import {
  Table,
  Column,
  DataType,
  HasMany,
  BelongsTo,
  ForeignKey,
  Model,
  AllowNull,
} from "sequelize-typescript";
import Expense from "./Expense";
import User from "./User";

@Table({
  tableName: "budgets",
})
class Budget extends Model {
  @AllowNull(false)
  @Column({
    type: DataType.STRING(100),
  })
  declare name: string;

  @AllowNull(false)
  @Column({
    type: DataType.DECIMAL,
  })
  declare amount: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare userId: number;

  @HasMany(() => Expense, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  declare expenses: Expense[];

  @BelongsTo(() => User)
  declare user: User;
}

export default Budget;
