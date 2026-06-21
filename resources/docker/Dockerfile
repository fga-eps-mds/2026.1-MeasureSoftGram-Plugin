FROM alpine:3.20 AS download

ARG ACT_VERSION=0.2.89
ARG TARGETARCH

RUN apk add --no-cache curl tar && \
    case "${TARGETARCH}" in \
      amd64) ACT_ARCH="x86_64" ;; \
      arm64) ACT_ARCH="arm64" ;; \
      *) echo "Arquitetura não suportada: ${TARGETARCH}" && exit 1 ;; \
    esac && \
    curl -fsSL "https://github.com/nektos/act/releases/download/v${ACT_VERSION}/act_Linux_${ACT_ARCH}.tar.gz" -o /tmp/act.tar.gz && \
    tar -xzf /tmp/act.tar.gz -C /usr/local/bin act && \
    chmod +x /usr/local/bin/act

FROM alpine:3.20
RUN apk add --no-cache ca-certificates
COPY --from=download /usr/local/bin/act /usr/local/bin/act

RUN mkdir -p /root/.config/act && \
    printf "%s\n%s\n%s\n" \
      "-P ubuntu-latest=catthehacker/ubuntu:act-latest" \
      "-P ubuntu-22.04=catthehacker/ubuntu:act-22.04" \
      "-P ubuntu-20.04=catthehacker/ubuntu:act-20.04" \
      > /root/.config/act/actrc

WORKDIR /workspace
ENTRYPOINT ["act"]