FROM nginx:latest

RUN rm -fr /etc/nginx/site-enabled/default.conf
RUN rm -fr /etc/nginx/conf.d/default.conf

COPY ./dist /usr/share/nginx/html
COPY docker/nginx/default.conf /etc/nginx/site-enabled/
COPY docker/nginx/default.conf /etc/nginx/conf.d/
COPY docker/entrypoint.sh /entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]