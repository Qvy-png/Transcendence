# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: aptive <aptive@student.42.fr>              +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2023/06/29 17:44:21 by aptive            #+#    #+#              #
#    Updated: 2023/06/29 17:44:22 by aptive           ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM    node:18-alpine

WORKDIR /app

# RUN npm install npm@latest
# RUN npm install -g @angular/cli

EXPOSE  4200

COPY ./tools/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

ENTRYPOINT [ "./entrypoint.sh" ]
# définir le point d'entrée pour le conteneur
# ENTRYPOINT ["npm", "start"]

# CMD ["tail", "-f"]
