import { expect, Page } from '@playwright/test';

export const SCRIPT_BADGE_SELECTOR = '[data-codex-script-debug="true"]';

export async function tagBrowserScript(page: Page, label: string): Promise<void> {
  const tagScript = (badgeLabel: string) => {
    const badgeAttribute = 'data-codex-script-debug';
    const renderBadge = () => {
      const existing = document.querySelector(`[${badgeAttribute}="true"]`);
      if (existing) {
        existing.remove();
      }

      const badge = document.createElement('div');
      badge.setAttribute(badgeAttribute, 'true');
      badge.textContent = `SCRIPT: ${badgeLabel}`;
      badge.style.position = 'fixed';
      badge.style.top = '10px';
      badge.style.right = '10px';
      badge.style.zIndex = '2147483647';
      badge.style.padding = '8px 12px';
      badge.style.borderRadius = '6px';
      badge.style.fontSize = '14px';
      badge.style.fontWeight = '700';
      badge.style.color = '#111';
      badge.style.background = '#fbd38d';
      badge.style.border = '2px solid #111';
      badge.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
      badge.style.pointerEvents = 'none';
      badge.style.userSelect = 'none';

      (document.body || document.documentElement).appendChild(badge);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', renderBadge, { once: true });
    } else {
      renderBadge();
    }
  };

  await page.addInitScript(tagScript, label);
  await page.evaluate(tagScript, label).catch(() => undefined);
}

export async function expectScriptBadgeVisible(page: Page, label: string): Promise<void> {
  await expect(page.locator(SCRIPT_BADGE_SELECTOR)).toContainText(`SCRIPT: ${label}`);
}
