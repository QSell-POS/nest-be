import { Entity, Column, BeforeInsert, BeforeUpdate } from "typeorm";
import { BaseEntity } from "src/common/entities/base.entity";
import { Exclude } from "class-transformer";
import * as bcrypt from "bcrypt";

export enum UserRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  MANAGER = "manager",
  CASHIER = "cashier",
  VIEWER = "viewer",
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

@Entity("users")
export class User extends BaseEntity {
  @Column({ name: "first_name", length: 50 })
  firstName: string;

  @Column({ name: "last_name", length: 50 })
  lastName: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ nullable: true, length: 20 })
  phone: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ type: "enum", enum: UserRole, default: UserRole.CASHIER })
  role: UserRole;

  @Column({ type: "enum", enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ name: "shop_id", nullable: true })
  shopId: string;

  @Column({ nullable: true, length: 255 })
  avatar: string;

  @Column({ name: "last_login_at", nullable: true })
  lastLoginAt: Date;

  @Column({ name: "refresh_token", nullable: true, type: "text" })
  @Exclude()
  refreshToken: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith("$2b$")) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
