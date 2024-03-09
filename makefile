migrate:
	npm run prisma:migrate

seed:
	npm run prisma:seed

reset:
	npm run prisma:reset

startdocker:
	docker start uscwebsite-hackathon-backend-dev-db-1

stopdocker:
	docker stop uscwebsite-hackathon-backend-dev-db-1

dev:
	npm run dev

run: startdocker dev