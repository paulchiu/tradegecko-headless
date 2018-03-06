const SIGNIN_URI = 'https://go.tradegecko.com/account/sign_in';
const USERNAME_SELECTOR = '#user_email';
const PASSWORD_SELECTOR = '#user_password';
const SIGNIN_BUTTON_SELECTOR = '#login';

/**
 * @param {puppeteer.Browser} browser 
 * @param {string} username 
 * @param {string} password 
 */
exports.signIn = async function (browser, username, password) {
    const page = await browser.newPage();
    await page.goto(SIGNIN_URI, { waitUntil: 'networkidle2' });
    await page.click(USERNAME_SELECTOR);
    await page.keyboard.type(username);
    await page.click(PASSWORD_SELECTOR);
    await page.keyboard.type(password);
    await page.click(SIGNIN_BUTTON_SELECTOR);
    await page.waitForNavigation();
    return page;
};