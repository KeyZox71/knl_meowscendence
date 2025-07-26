FROM		docker.elastic.co/logstash/logstash-wolfi:9.0.3

RUN			rm -f /usr/share/logstash/pipeline/logstash.conf

COPY		--chmod=777 pipeline/ /usr/share/logstash/pipeline/
COPY		--chmod=777 config/ /usr/share/logstash/config/
