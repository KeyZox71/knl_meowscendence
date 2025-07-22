FROM		prom/prometheus

ARG			PROM_ADMIN_PASSWD
ARG			PROM_ADMIN_PASSWD_HASH

COPY		./config/prometheus.yml /etc/prometheus/prometheus.yml
COPY		./config/web-config.yml /etc/prometheus/web-config.yml
COPY		./config/rules.yml /etc/prometheus/rules.yml

RUN			sed -i "s/PROM_ADMIN_PASSWD/$(printf '%s\n' "$PROM_ADMIN_PASSWD" | sed -e 's/[\/&]/\\&/g')/g" /etc/prometheus/prometheus.yml
RUN			sed -i "s/PROM_ADMIN_PASSWD_HASH/$(printf '%s\n' "$PROM_ADMIN_PASSWD_HASH" | sed -e 's/[\/&]/\\&/g')/g" /etc/prometheus/web-config.yml
