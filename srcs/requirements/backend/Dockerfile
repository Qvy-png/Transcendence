# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: rpol <rpol@student.42.fr>                  +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2023/06/07 16:09:16 by aptive            #+#    #+#              #
#    Updated: 2023/09/07 17:18:31 by rpol             ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM node:18-alpine

RUN apk add npm

RUN mkdir /app
# COPY ./srcs /srcs
# COPY ./srcs /app
COPY ./prisma /prisma
WORKDIR /app


EXPOSE 3000
EXPOSE 3001
EXPOSE 3002
EXPOSE 5555

COPY ./tools/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# définir le point d'entrée pour le conteneur
ENTRYPOINT [ "./entrypoint.sh" ]

# CMD [ "npm", "run", "start:prod" ]
# CMD [  "tail", "-f" ]
