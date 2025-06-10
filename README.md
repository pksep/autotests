Russian is below
English
## Tutorial: Structuring Playwright Test Classes Using TypeScript

### IntroductionXX

In this tutorial, we will explore different approaches to structuring your Playwright test classes using TypeScript. We'll start by understanding your initial code structure, then dive into two scenarios: extending abstract classes and extending the Playwright `Page` class directly. Finally, we'll list the advantages and disadvantages of each approach and provide a recommendation based on the needs of your project.

### Initial Code Structure

#### `AbstractPage` Class
This class serves as a base class holding a reference to the Playwright `Page` instance and includes common methods.

```typescript
import { Page } from '@playwright/test';
import logger from '../lib/logger';

export abstract class AbstractPage {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async navigateTo(url: string): Promise<void> {
        logger.info(`Navigating to ${url}`);
        await this.page.goto(url);
    }

    // Example common method
    async captureScreenshot(filename: string): Promise<void> {
        logger.info(`Capturing screenshot: ${filename}`);
        await this.page.screenshot({ path: filename });
    }
}
```

#### `PageObject` Class
This class extends `AbstractPage` and adds more common functionality.

```typescript
import { AbstractPage } from './AbstractPage';

export class PageObject extends AbstractPage {
    constructor(page: Page) {
        super(page);
    }

    async waitForElement(selector: string): Promise<void> {
        logger.info(`Waiting for element with selector: ${selector}`);
        await this.page.waitForSelector(selector);
    }
}
```

#### `LoginPage` Class
This class extends `PageObject` and includes specific functionalities for the login page.

```typescript
import { PageObject } from './PageObject';
import { Button } from './Button';
import { Input } from './Input';

export class LoginPage extends PageObject {
    private button: Button;
    private input: Input;

    constructor(page: Page) {
        super(page);
        this.button = new Button(page);
        this.input = new Input(page);
    }

    async open(): Promise<void> {
        await this.navigateTo('http://example.com/login');
    }

    async fillEmail(value: string): Promise<void> {
        logger.info(`Filling email with value: ${value}`);
        await this.input.setInputValue('#email', value);
    }

    async fillPassword(value: string): Promise<void> {
        logger.info(`Filling password with value: ${value}`);
        await this.input.setInputValue('#password', value);
    }

    async clickLoginButton(): Promise<void> {
        logger.info('Clicking login button');
        await this.button.clickButton('#login-button');
    }
}
```

### Scenario 1: Extending Abstract Classes

In this scenario, `AbstractPage` holds a reference to the `Page` instance, and `PageObject` extends `AbstractPage`.

#### Structure
1. **AbstractPage**: Base class holding a reference to the `Page` instance.
2. **PageObject**: Extends `AbstractPage` and adds common functionality.
3. **MyPage**: Extends `PageObject` and adds page-specific functionality.

#### Example

```typescript
// AbstractPage Class
import { Page } from '@playwright/test';
import logger from '../lib/logger';

export abstract class AbstractPage {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async navigateTo(url: string): Promise<void> {
        logger.info(`Navigating to ${url}`);
        await this.page.goto(url);
    }

    async captureScreenshot(filename: string): Promise<void> {
        logger.info(`Capturing screenshot: ${filename}`);
        await this.page.screenshot({ path: filename });
    }
}

// PageObject Class
import { AbstractPage } from './AbstractPage';

export class PageObject extends AbstractPage {
    constructor(page: Page) {
        super(page);
    }

    async waitForElement(selector: string): Promise<void> {
        logger.info(`Waiting for element with selector: ${selector}`);
        await this.page.waitForSelector(selector);
    }
}

// MyPage Class
import { PageObject } from './PageObject';

export class MyPage extends PageObject {
    constructor(page: Page) {
        super(page);
    }

    // Override the goto method
    async goto(url: string, options?: { timeout?: number, waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' }): Promise<void> {
        logger.info(`Navigating to ${url} with custom behavior.`);
        
        // Custom actions before navigation
        await this.captureScreenshot('before-navigation.png');

        // Call the original navigateTo method
        await this.navigateTo(url);

        // Custom actions after navigation
        await this.captureScreenshot('after-navigation.png');
    }
}

// Usage Example
const page = await browser.newPage();
const myPage = new MyPage(page);

await myPage.goto('http://example.com'); // Calls the overridden goto method
```

### Scenario 2: Extending the Page Class Directly

In this scenario, `AbstractPage` extends the Playwright `Page` class directly.

#### Structure
1. **AbstractPage**: Extends the `Page` class directly.
2. **PageObject**: Extends `AbstractPage` and adds common functionality.
3. **MyPage**: Extends `PageObject` and adds page-specific functionality.

#### Example

```typescript
// AbstractPage Class
import { Page } from '@playwright/test';
import logger from '../lib/logger';

export abstract class AbstractPage extends Page {
    constructor(page: Page) {
        super(page.context(), page._connection); // Initialize the Page class
    }

    async navigateTo(url: string): Promise<void> {
        logger.info(`Navigating to ${url}`);
        await this.goto(url); // Use the Page class's goto method
    }

    async captureScreenshot(filename: string): Promise<void> {
        logger.info(`Capturing screenshot: ${filename}`);
        await this.screenshot({ path: filename });
    }
}

// PageObject Class
import { AbstractPage } from './AbstractPage';

export class PageObject extends AbstractPage {
    constructor(page: Page) {
        super(page);
    }

    async waitForElement(selector: string): Promise<void> {
        logger.info(`Waiting for element with selector: ${selector}`);
        await this.waitForSelector(selector);
    }
}

// MyPage Class
import { PageObject } from './PageObject';

export class MyPage extends PageObject {
    constructor(page: Page) {
        super(page);
    }

    // Override the goto method
    async goto(url: string, options?: { timeout?: number, waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' }): Promise<void> {
        logger.info(`Navigating to ${url} with custom behavior.`);
        
        // Custom actions before navigation
        await this.captureScreenshot('before-navigation.png');

        // Call the original goto method with custom logic
        await super.goto(url, options);

        // Custom actions after navigation
        await this.captureScreenshot('after-navigation.png');
    }
}

// Usage Example
const page = await browser.newPage();
const myPage = new MyPage(page);

await myPage.goto('http://example.com'); // Calls the overridden goto method
```

### Advantages and Disadvantages

#### Scenario 1: Extending `PageObject` which Holds a `Page` Reference

**Advantages:**
1. **Modularity**: High, allowing for clean separation of concerns.
2. **Customization**: Extensive customization of methods and functionality.
3. **Maintainability**: Better for managing and updating a complex project.
4. **Reusability**: Promotes reusability of common components.

**Disadvantages:**
1. **Indirect Access**: Methods from the `Page` class are accessed via `this.page`.
2. **Additional Layer of Abstraction**: Adds complexity and can make the code harder to follow.
3. **Performance Overhead**: Slight performance overhead due to additional method calls.

#### Scenario 2: Extending the `Page` Class Directly

**Advantages:**
1. **Direct Access**: Directly inherits all methods from the `Page` class.
2. **Simplicity**: Provides a simpler structure with direct method access.
3. **Performance**: Potentially better performance with fewer method calls.

**Disadvantages:**
1. **Reduced Modularity**: Less modular and more tightly coupled.
2. **Tight Coupling**: Harder to decouple or replace parts of the functionality.
3. **Less Separation of Concerns**: Mixed logic reduces clarity and maintainability.
4. **Potential Overriding Issues**: Risk of conflicts and unexpected behavior.

### Recommendation

Based on the complexity of your project and the detailed testing scenarios we discussed, I recommend using **Scenario 1** where `PageObject` holds a reference to the `Page` instance.

### Reasons for Recommendation:
1. **Modularity and Customization**: Allows for a modular and clean design with extensive customization.
2. **Separation of Concerns**: Ensures a clear separation between common and page-specific logic, making the codebase more maintainable.
3. **Maintainability**: Better suited for maintaining and updating complex projects with detailed test cases.
4. **Reusability**: Promotes the reuse of common components, reducing code duplication.

---

Russian

Конечно! Вот полное руководство на русском языке:

---

## Руководство: Структурирование классов тестирования Playwright с использованием TypeScript

### Введение

В этом руководстве мы рассмотрим различные подходы к структурированию ваших тестовых классов Playwright с использованием TypeScript. Мы начнем с понимания вашей начальной структуры кода, затем погрузимся в два сценария: расширение абстрактных классов и расширение класса Playwright `Page` напрямую. В конце мы перечислим преимущества и недостатки каждого подхода и предоставим рекомендации на основе потребностей вашего проекта.

### Начальная структура кода

#### Класс `AbstractPage`
Этот класс служит базовым классом, содержащим ссылку на экземпляр Playwright `Page` и включает общие методы.

```typescript
import { Page } from '@playwright/test';
import logger from '../lib/logger';

export abstract class AbstractPage {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async navigateTo(url: string): Promise<void> {
        logger.info(`Navigating to ${url}`);
        await this.page.goto(url);
    }

    // Пример общего метода
    async captureScreenshot(filename: string): Promise<void> {
        logger.info(`Capturing screenshot: ${filename}`);
        await this.page.screenshot({ path: filename });
    }
}
```

#### Класс `PageObject`
Этот класс расширяет `AbstractPage` и добавляет более общие функции.

```typescript
import { AbstractPage } from './AbstractPage';

export class PageObject extends AbstractPage {
    constructor(page: Page) {
        super(page);
    }

    async waitForElement(selector: string): Promise<void> {
        logger.info(`Waiting for element with selector: ${selector}`);
        await this.page.waitForSelector(selector);
    }
}
```

#### Класс `LoginPage`
Этот класс расширяет `PageObject` и включает специфические функции для страницы входа.

```typescript
import { PageObject } from './PageObject';
import { Button } from './Button';
import { Input } from './Input';

export class LoginPage extends PageObject {
    private button: Button;
    private input: Input;

    constructor(page: Page) {
        super(page);
        this.button = new Button(page);
        this.input = new Input(page);
    }

    async open(): Promise<void> {
        await this.navigateTo('http://example.com/login');
    }

    async fillEmail(value: string): Promise<void> {
        logger.info(`Filling email with value: ${value}`);
        await this.input.setInputValue('#email', value);
    }

    async fillPassword(value: string): Promise<void> {
        logger.info(`Filling password with value: ${value}`);
        await this.input.setInputValue('#password', value);
    }

    async clickLoginButton(): Promise<void> {
        logger.info('Clicking login button');
        await this.button.clickButton('#login-button');
    }
}
```

### Сценарий 1: Расширение абстрактных классов

В этом сценарии класс `AbstractPage` содержит ссылку на экземпляр `Page`, а `PageObject` расширяет `AbstractPage`.

#### Структура
1. **AbstractPage**: Базовый класс, содержащий ссылку на экземпляр `Page`.
2. **PageObject**: Расширяет `AbstractPage` и добавляет общую функциональность.
3. **MyPage**: Расширяет `PageObject` и добавляет функциональность, специфическую для страницы.

#### Пример

```typescript
// Класс AbstractPage
import { Page } from '@playwright/test';
import logger from '../lib/logger';

export abstract class AbstractPage {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async navigateTo(url: string): Promise<void> {
        logger.info(`Navigating to ${url}`);
        await this.page.goto(url);
    }

    async captureScreenshot(filename: string): Promise<void> {
        logger.info(`Capturing screenshot: ${filename}`);
        await this.page.screenshot({ path: filename });
    }
}

// Класс PageObject
import { AbstractPage } from './AbstractPage';

export class PageObject extends AbstractPage {
    constructor(page: Page) {
        super(page);
    }

    async waitForElement(selector: string): Promise<void> {
        logger.info(`Waiting for element with selector: ${selector}`);
        await this.page.waitForSelector(selector);
    }
}

// Класс MyPage
import { PageObject } from './PageObject';

export class MyPage extends PageObject {
    constructor(page: Page) {
        super(page);
    }

    // Переопределение метода goto
    async goto(url: string, options?: { timeout?: number, waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' }): Promise<void> {
        logger.info(`Navigating to ${url} with custom behavior.`);
        
        // Пользовательские действия перед навигацией
        await this.captureScreenshot('before-navigation.png');

        // Вызов оригинального метода navigateTo
        await this.navigateTo(url);

        // Пользовательские действия после навигации
        await this.captureScreenshot('after-navigation.png');
    }
}

// Пример использования
const page = await browser.newPage();
const myPage = new MyPage(page);

await myPage.goto('http://example.com'); // Вызывает переопределенный метод goto
```

### Сценарий 2: Расширение класса Page напрямую

В этом сценарии класс `AbstractPage` напрямую расширяет класс Playwright `Page`.

#### Структура
1. **AbstractPage**: Напрямую расширяет класс `Page`.
2. **PageObject**: Расширяет `AbstractPage` и добавляет общую функциональность.
3. **MyPage**: Расширяет `PageObject` и добавляет функциональность, специфическую для страницы.

#### Пример

```typescript
// Класс AbstractPage
import { Page } from '@playwright/test';
import logger from '../lib/logger';

export abstract class AbstractPage extends Page {
    constructor(page: Page) {
        super(page.context(), page._connection); // Инициализация класса Page
    }

    async navigateTo(url: string): Promise<void> {
        logger.info(`Navigating to ${url}`);
        await this.goto(url); // Использование метода goto класса Page
    }

    async captureScreenshot(filename: string): Promise<void> {
        logger.info(`Capturing screenshot: ${filename}`);
        await this.screenshot({ path: filename });
    }
}

// Класс PageObject
import { AbstractPage } from './AbstractPage';

export class PageObject extends AbstractPage {
    constructor(page: Page) {
        super(page);
    }

    async waitForElement(selector: string): Promise<void> {
        logger.info(`Waiting for element with selector: ${selector}`);
        await this.waitForSelector(selector);
    }
}

// Класс MyPage
import { PageObject } from './PageObject';

export class MyPage extends PageObject {
    constructor(page: Page) {
        super(page);
    }

    // Переопределение метода goto
    async goto(url: string, options?: { timeout?: number, waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' }): Promise<void> {
        logger.info(`Navigating to ${url} with custom behavior.`);
        
        // Пользовательские действия перед навигацией
        await this.captureScreenshot('before-navigation.png');

        // Вызов оригинального метода goto с пользовательской логикой
        await super.goto(url, options);

        // Пользовательские действия после навигации
        await this.captureScreenshot('after-navigation.png');
    }
}

// Пример использования
const page = await browser.newPage();
const myPage = new MyPage(page);

await myPage.goto('http://example.com'); // Вызывает переопределенный метод goto
```

### Преимущества и недостатки

#### Сценарий 1: Расширение `PageObject`, который содержит ссылку на `Page`

**Преимущества:**
1. **Модульность**: Высокая, позволяет чисто разделять ответственность.
2. **Настраиваемость**: Широкая возможность настройки методов и функциональности.
3. **Поддерживаемость**: Легче управлять и обновлять сложный проект.
4. **Повторное использование**: Способствует повторному использованию общих компонентов.

**Недостатки:**
1. **Косвенный доступ**: Методы класса `Page` доступны через `this.page`.
2. **Дополнительный слой абстракции**: Увеличивает сложность и может усложнить код.
3. **Производственные издержки**: Небольшие производственные издержки из-за дополнительных вызовов методов.

#### Сценарий 2: Расширение класса `Page` напрямую

**Преимущества:**
1. **Прямой доступ**: Напрямую наследует все методы класса `Page`.
2. **Простота**: Обеспечивает более простую структуру с прямым доступом к методам.
3. **Производительность**: Потенциально лучшая производительность с меньшим количеством вызовов методов.

**Недостатки:**
1. **Снижение модульности**: Менее модульная и более жестко связанная структура.
2. **Тесная связь**: Сложнее отделить или заменить части функциональности.
3. **Меньшее разделение обязанностей**: Смешанная логика уменьшает ясность и поддерж

