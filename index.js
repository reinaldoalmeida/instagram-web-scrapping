require("dotenv").config();

const fs = require("fs");
const process = require("process");
const readline = require("readline");
// const puppeteer = require("puppeteer");
const headless = require("puppeteer-extra");
const stealthplugin = require("puppeteer-extra-plugin-stealth");

headless.use(stealthplugin());
headless.launch({ headless: true }).then(async (browser) => {
    // (async () => {
    // const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // login page
    const username = process.env.username;
    const password = process.env.password;

    await page.goto("https://instagram.com", {
        waitUntil: "networkidle0",
    });
    await page.type("input[name='username']", username);
    await page.type("input[name='password']", password);
    await page.click(".sqdOP.L3NKy.y3zKF");
    await page.waitForNavigation({
        waitUntil: "networkidle0",
    });
    console.log("Login... DONE");

    // redirect -> two-factor authentication page ?
    const URL2FAuth = await page.evaluate(() => location.href);
    if (
        URL2FAuth.startsWith(
            "https://www.instagram.com/accounts/login/two_factor"
        )
    ) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        const verificationCode = await new Promise((resolve) => {
            rl.question("What is your Verification Code? ", (answer) =>
                resolve(answer)
            );
        });

        // type verification code
        await page.type("input[name='verificationCode']", verificationCode);
        await page.click(".sqdOP.L3NKy.y3zKF");
        await page.waitForNavigation({
            waitUntil: "networkidle0",
        });
        console.log("Two Factor Authentication... DONE");
    }

    // save your login info on this browser
    const URLSaveLogin = await page.evaluate(() => location.href);
    if (URLSaveLogin.startsWith("https://www.instagram.com/accounts/onetap")) {
        // click -> Save Info
        await page.click(".sqdOP.L3NKy.y3zKF");
        await page.waitForNavigation({
            waitUntil: "networkidle0",
        });
        console.log("Save Login Info... DONE");
    }

    // turn on Notifications
    const turnOnNotifications = await page.evaluate(() => {
        let el = document.querySelector(".aOOlW.bIiDR");
        return el ? el.innerText : "";
    });
    if (turnOnNotifications) {
        // click -> Turn On
        await page.click(".aOOlW.bIiDR");
        page.on("dialog", async (dialog) => {
            console.log("here");
            await dialog.accept();
        });
        console.log("Turn On Notifications... DONE");
    }

    // navigate to a specific profile
    const URLToNavigate = "https://instagram.com/spacex";
    await page.goto(URLToNavigate, {
        waitUntil: "networkidle0",
    });
    console.log(`Navigate to ${URLToNavigate} ... DONE`);

    // get the photo's
    const imgList = await page.evaluate(() => {
        const nodeList = document.querySelectorAll("article img");
        const imgArray = [...nodeList];
        const imgList = imgArray.map(({ src }) => ({ src }));
        return imgList;
    });
    console.log(`Get all images from ${URLToNavigate} ... DONE`);

    // save photo's
    fs.writeFile("instagram.json", JSON.stringify(imgList, null, 2), (err) => {
        if (err) {
            throw new Error(err);
        }
        console.log(`Save images ... DONE`);
        console.log("Well DONE!");
    });

    await browser.close();
});
