FROM		grafana/grafana-oss

ARG			PROM_ADMIN_PASSWD

COPY		sources /etc/grafana/provisioning/datasources
COPY		dashboards /dashboards
COPY		dash-providers /etc/grafana/provisioning/dashboards

RUN			sed -i "s|basicAuthPassword:|basicAuthPassword: $PROM_ADMIN_PASSWD|" /etc/grafana/provisioning/datasources/prometheus.yml
