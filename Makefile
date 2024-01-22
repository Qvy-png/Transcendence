# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: rpol <rpol@student.42.fr>                  +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2023/06/05 15:17:59 by aptive            #+#    #+#              #
#    Updated: 2023/09/12 15:14:35 by rpol             ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

.PHONY: all re clean fclean

all:
	@docker compose -f ./srcs/docker-compose.yml up -d --build

re: fclean all


down :
	@docker compose -f ./srcs/docker-compose.yml down

clean:
	@docker compose -f ./srcs/docker-compose.yml down --remove-orphans
	rm -rf ./srcs/requirements/frontend/dist
	rm -rf ./srcs/requirements/frontend/package-lock.json
	rm -rf ./srcs/requirements/frontend/node_modules
	rm -rf ./srcs/requirements/backend/node_modules
	rm -rf ./srcs/requirements/backend/package-lock.json

fclean: clean
	@docker volume rm srcs_front srcs_db-data srcs_back
	docker volume prune -f
	docker image prune -f -a

cleanBack : clean
	@docker 

execDB:
	@docker exec -ti postgredb /bin/sh

execBack:
	@docker exec -ti backend /bin/sh

execFront:
	@docker exec -ti front /bin/sh
