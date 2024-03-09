import { IGCategory } from '@prisma/client'

export type MainSchemaType = {
  id: number
  name: string
  description: string
  organisationType: IGCategory
  frequency?: string
  isAdminOrg?: number
  igHeadFullName: string
  inviteOrContactLink?: string
  igHeadTeleUsername: string
  otherMembers?: string
  otherMembersTeleUsername?: string
  isInactive?: number
  isInvisible?: number
}

export const mainSchema = {
  id: { prop: 'id', type: Number, required: true },
  name: { prop: 'name', type: String, required: true },
  description: { prop: 'description', type: String },
  organisationType: {
    prop: 'organisationType',
    type: String,
    oneOf: ['Sports', 'SocioCultural', 'Others', 'Inactive', 'Guips'],
    required: true,
  },
  frequency: { prop: 'frequency', type: String },
  isAdminOrg: { prop: 'isAdminOrg', type: Number },
  igHeadFullName: { prop: 'igHeadFullName', type: String, required: true },
  inviteOrContactLink: { prop: 'inviteOrContactLink', type: String },
  igHeadTeleUsername: {
    prop: 'igHeadTeleUsername',
    type: String,
    required: true,
  },
  otherMembers: { prop: 'otherMembers', type: String },
  otherMembersTeleUsername: { prop: 'otherMembersTeleUsername', type: String },
  isInactive: { prop: 'isInactive', type: Number },
  isInvisible: { prop: 'isInvisible', type: Number },
}

export const userSchema = {
  id: { prop: 'id', type: Number, required: true },
  telegramUserName: { prop: 'telegramUserName', type: String, required: true },
  name: { prop: 'name', type: String, required: true },
}

export const venueSchema = {
  id: { prop: 'id', type: Number, required: true },
  name: { prop: 'name', type: String, required: true },
}

export type UserOnOrgSchemaType = {
  userId: number
  orgId: number
  isIGHead: number
}

export const userOnOrgSchema = {
  userId: { prop: 'userId', type: Number, required: true },
  orgId: { prop: 'orgId', type: Number, required: true },
  isIGHead: { prop: 'isIGHead', type: Number, required: true },
}

// model Ability {
//   id            Int           @id @default(autoincrement())
//   name          String        @unique
//   description   String
//   createdAt     DateTime      @default(now())
//   roleAbilities RoleAbility[]
// }

export const abilitySchema = {
  id: { prop: 'id', type: Number, required: true },
  name: { prop: 'name', type: String, required: true },
  description: { prop: 'description', type: String },
}

// model Role {
//   id            Int           @id @default(autoincrement())
//   name          String        @unique
//   createdAt     DateTime      @default(now())
//   roleAbilities RoleAbility[]
//   orgRoles      OrgRole[]
// }

export const roleSchema = {
  id: { prop: 'id', type: Number, required: true },
  name: { prop: 'name', type: String, required: true },
}

// model RoleAbility {
//   id        Int     @id @default(autoincrement())
//   roleId    Int
//   abilityId Int
//   role      Role    @relation(fields: [roleId], references: [id], onDelete: Cascade, onUpdate: Cascade)
//   ability   Ability @relation(fields: [abilityId], references: [id], onDelete: Cascade, onUpdate: Cascade)

//   @@unique([roleId, abilityId])
// }

export const roleAbilitySchema = {
  roleId: { prop: 'roleId', type: Number, required: true },
  abilityId: { prop: 'abilityId', type: Number, required: true },
}

// model OrgRole {
//   id           Int          @id @default(autoincrement())
//   orgId        Int
//   roleId       Int
//   organisation Organisation @relation(fields: [orgId], references: [id], onDelete: Cascade, onUpdate: Cascade)
//   role         Role         @relation(fields: [roleId], references: [id], onDelete: Cascade, onUpdate: Cascade)

//   @@unique([orgId, roleId])
// }

export const orgRoleSchema = {
  orgId: { prop: 'orgId', type: Number, required: true },
  roleId: { prop: 'roleId', type: Number, required: true },
}
