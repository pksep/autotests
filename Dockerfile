FROM mcr.microsoft.com/playwright:v1.50.1-noble

WORKDIR /app

ENV CI=true \
    HEADLESS=true \
    TEST_SUITE=all_api_tests \
    REPORTS_DIR=/app/reports \
    CRON_SCHEDULE="0 6 * * *" \
    RUN_ON_START=false \
    SCHEDULE_ENABLED=true \
    GENERATE_ALLURE=true \
    TZ=Europe/Minsk

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates cron openjdk-17-jre-headless \
    && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml ./

RUN corepack enable \
    && corepack prepare pnpm@9.15.4 --activate \
    && pnpm install --frozen-lockfile

COPY . .

RUN chmod +x scripts/run-scheduled-api-tests.sh

VOLUME ["/app/reports"]

ENTRYPOINT ["./scripts/run-scheduled-api-tests.sh"]
