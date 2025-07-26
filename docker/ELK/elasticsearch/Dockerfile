FROM		docker.elastic.co/elasticsearch/elasticsearch-wolfi:9.0.4

COPY		--chown=elasticsearch:elasticsearch elasticsearch.yml /usr/share/elasticsearch/config/
COPY		--chown=elasticsearch:elasticsearch jvm.options /usr/share/elasticsearch/config/jvm.options.d/custom.options
