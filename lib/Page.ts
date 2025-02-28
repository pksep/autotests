name: CI/CD for Main Branch

on:
  pull_request:
    branches:
      - CI-CD-Test-Main

jobs:
  build:
    runs-on: ubuntu-22.04

    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '22.13.1'

      - name: Install dependencies
        run: npm install

      - name: Install Playwright dependencies
        run: sudo npx playwright install-deps

      - name: Install Playwright browsers
        run: npx playwright install

      - name: Run Playwright tests with xvfb
        env:
          TEST_DIR: '.'
          BASE_URL: 'http://dev.npoamotiv.ru'
        run: xvfb-run --auto-servernum --server-args="-screen 0 1920x1080x24" npm run test

      - name: Generate Allure report
        if: always()
        run: |
          npm install -g allure-commandline --save-dev
          allure generate --clean

      - name: List Allure report directory
        if: always()
        run: ls -la allure-report

      - name: Upload Allure report as artifact
        if: always()
        uses: actions/upload-artifact@v2
        with:
          name: allure-report
          path: allure-report

  deploy:
    needs: build
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Download Allure report artifact
        uses: actions/download-artifact@v2
        with:
          name: allure-report
          path: allure-report

      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v1
        with:
          branch: gh-pages
          folder: allure-report
