#!/bin/sh
set -eu

cd /app

: "${REPORTS_DIR:=/app/reports}"
: "${CRON_SCHEDULE:=0 6 * * *}"
: "${TEST_SUITE:=all_api_tests}"
: "${GENERATE_ALLURE:=true}"
: "${RUN_ON_START:=false}"
: "${SCHEDULE_ENABLED:=true}"

run_tests() {
  started_at="$(date -Iseconds)"
  run_id="$(date +%Y%m%d-%H%M%S)"
  run_dir="${REPORTS_DIR}/${run_id}"

  mkdir -p "${run_dir}"

  echo "Starting API autotests at ${started_at}"
  echo "TEST_SUITE=${TEST_SUITE}"
  echo "API_BASE_URL=${API_BASE_URL:-not set}"

  rm -rf playwright-report allure-results allure-report test-results

  set +e
  pnpm exec playwright test
  test_exit_code=$?
  set -e

  if [ -d playwright-report ]; then
    cp -R playwright-report "${run_dir}/playwright-report"
  fi

  if [ -d test-results ]; then
    cp -R test-results "${run_dir}/test-results"
  fi

  if [ -d allure-results ]; then
    cp -R allure-results "${run_dir}/allure-results"

    if [ "${GENERATE_ALLURE}" = "true" ]; then
      set +e
      pnpm run allure:generate
      allure_exit_code=$?
      set -e

      if [ "${allure_exit_code}" -eq 0 ] && [ -d allure-report ]; then
        cp -R allure-report "${run_dir}/allure-report"
      else
        echo "Allure report generation failed with exit code ${allure_exit_code}" > "${run_dir}/allure-error.txt"
      fi
    fi
  fi

  finished_at="$(date -Iseconds)"
  {
    echo "started_at=${started_at}"
    echo "finished_at=${finished_at}"
    echo "test_suite=${TEST_SUITE}"
    echo "exit_code=${test_exit_code}"
  } > "${run_dir}/status.env"

  ln -sfn "${run_dir}" "${REPORTS_DIR}/latest"

  echo "Finished API autotests at ${finished_at}; report directory: ${run_dir}; exit code: ${test_exit_code}"
  return "${test_exit_code}"
}

write_env_file() {
  env | while IFS='=' read -r name value; do
    case "${name}" in
      ''|*[!A-Za-z0-9_]*|[0-9]*)
        continue
        ;;
    esac

    escaped_value="$(printf "%s" "${value}" | sed "s/'/'\\\\''/g")"
    printf "export %s='%s'\n" "${name}" "${escaped_value}"
  done > /tmp/api-tests-env
}

if [ "${1:-}" = "run-once" ]; then
  run_tests
  exit $?
fi

mkdir -p "${REPORTS_DIR}"

if [ "${RUN_ON_START}" = "true" ]; then
  run_tests || true
fi

if [ "${SCHEDULE_ENABLED}" != "true" ]; then
  run_tests
  exit $?
fi

write_env_file
echo "${CRON_SCHEDULE} . /tmp/api-tests-env; /app/scripts/run-scheduled-api-tests.sh run-once >> ${REPORTS_DIR}/scheduler.log 2>&1" > /tmp/api-tests-crontab
crontab /tmp/api-tests-crontab
echo "API autotests scheduler started. CRON_SCHEDULE=${CRON_SCHEDULE}"

exec cron -f -L 15
