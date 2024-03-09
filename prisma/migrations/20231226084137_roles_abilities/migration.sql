-- CreateTable
CREATE TABLE "Ability" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleAbility" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "abilityId" INTEGER NOT NULL,

    CONSTRAINT "RoleAbility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgRole" (
    "id" SERIAL NOT NULL,
    "orgId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "OrgRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ability_name_key" ON "Ability"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RoleAbility_roleId_abilityId_key" ON "RoleAbility"("roleId", "abilityId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgRole_orgId_roleId_key" ON "OrgRole"("orgId", "roleId");

-- AddForeignKey
ALTER TABLE "RoleAbility" ADD CONSTRAINT "RoleAbility_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleAbility" ADD CONSTRAINT "RoleAbility_abilityId_fkey" FOREIGN KEY ("abilityId") REFERENCES "Ability"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgRole" ADD CONSTRAINT "OrgRole_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgRole" ADD CONSTRAINT "OrgRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
