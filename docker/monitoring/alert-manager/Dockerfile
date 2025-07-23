FROM		prom/alertmanager:latest

ARG			SMTP_SMARTHOST
ARG			SMTP_FROM
ARG			SMTP_AUTH_USERNAME
ARG			SMTP_AUTH_PASSWORD
ARG			EMAIL_TO

COPY		alertmanager.yml /etc/alertmanager/alertmanager.yml

RUN			sed -i "s|smtp_smarthost: *|smtp_smarthost: '${SMTP_SMARTHOST}'|" /etc/alertmanager/alertmanager.yml && \
			sed -i "s|smtp_from: *|smtp_from: '${SMTP_FROM}'|" /etc/alertmanager/alertmanager.yml && \
			sed -i "s|smtp_auth_username: *|smtp_auth_username: '${SMTP_AUTH_USERNAME}'|" /etc/alertmanager/alertmanager.yml && \
			sed -i "s|smtp_auth_password: *|smtp_auth_password: '${SMTP_AUTH_PASSWORD}'|" /etc/alertmanager/alertmanager.yml && \
			sed -i "s|to: *|to: '${EMAIL_TO}'|" /etc/alertmanager/alertmanager.yml
