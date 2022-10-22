import puppeteer from "puppeteer-extra";
import RecaptchaPlugin from "puppeteer-extra-plugin-recaptcha";
import { db } from "../..";
import { getPage } from "./getPage";
import { JSDOM } from "jsdom";
export const sleep = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
export const scrape = async (name: string) => {
  puppeteer.use(
    RecaptchaPlugin({
      provider: {
        id: "2captcha",
        token: "9d94f778f772d001fbc9662758ad27d2",
      },
    })
  );
  const puppeteerOptions = {
    ignoreHTTPSErrors: true,
    headless: false,
    args: [
      "--disable-dev-shm-usage",
      "--no-sandbox",
      '--user-data-dir="/tmp/chromium"',
      "--disable-web-security",
      "--disable-features=site-per-process",
      "--proxy-server=zproxy.lum-superproxy.io:22225",
    ],
  };
  const browser = await puppeteer.launch(puppeteerOptions);
  try {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    let response: any;
    const rejectRequestPattern = [
      "googlesyndication.com",
      "/*.doubleclick.net",
      "/*.amazon-adsystem.com",
      "/*.adnxs.com",
    ];
    const blockList = [];
    let result;
    page.on("request", (request) => {
      if (
        rejectRequestPattern.find((pattern) => request.url().match(pattern)) ||
        request.resourceType() == "stylesheet" ||
        request.resourceType() == "font" ||
        request.resourceType() == "image"
      ) {
        blockList.push(request.url());
        request.abort();
      } else request.continue();
    });
    const doc = await db.collection("trueps").doc("cookies").get();
    const cookies = await doc.data()?.cookies;
    if (cookies) {
      await page.setCookie(...cookies);
    }
    await sleep(1000);
    await page.setViewport({
      width: 1920 + Math.floor(Math.random() * 100),
      height: 1800 + Math.floor(Math.random() * 100),
      deviceScaleFactor: 1,
      hasTouch: false,
      isLandscape: false,
      isMobile: false,
    });

    //  const blockList = [];
    await page.authenticate({
      username: "http://brd-customer-hl_6f11a31b-zone-isp",
      password: "u2cqdes5jp6m",
    });
    // await page.authenticate({
    //   username: "lum-customer-hl_df4275c9-zone-djoresidentiall",
    //   password: "ah07kr5u43iu",
    // });
    const url = "https://www.truepeoplesearch.com";
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 0,
    });
    // page.on("response", async (response) => {
    //   if (response.url().endsWith("/hcaptcha.html")) {
    //     console.log("hcaptcha", response.status());
    //     await page.solveRecaptchas();
    //     await page.click("button");
    //     await sleep(2000);
    //     const cookies = await page.cookies();
    //     const cmaDb = db.collection("trueps");
    //     const cookiesdb = cmaDb.doc("cookies");
    //     await cookiesdb.set({
    //       cookies,
    //       created_at: new Date().toISOString(),
    //     });
    //   }
    // });
    await page.waitForSelector(".input-n", { timeout: 10000 });
    await sleep(500 + Math.floor(Math.random() * 100));
    response = await page.evaluate(async (name) => {
      const res = await fetch(
        `https://www.truepeoplesearch.com/results?name=${name}`
      );

      const content = await res.text();
      if (content.includes("h-captcha")) {
        if (document.querySelector(".input-n")) {
          (<HTMLInputElement>document.querySelector(".input-n")).value = name;
        }
        return "captcha";
      } else {
        return content;
      }
    }, name);
    if (response === "captcha") {
      console.log("captcha!!");

      await sleep(400 + Math.floor(Math.random() * 100));
      await page.keyboard.press("Enter");
      await page.keyboard.press("Enter");
      await page.waitForSelector(".h-captcha");
      await page.solveRecaptchas();
      await page.click("button");
      await sleep(2000);
      const cookies = await page.cookies();
      const cmaDb = db.collection("trueps");
      const cookiesdb = cmaDb.doc("cookies");
      await cookiesdb.set({
        cookies,
        created_at: new Date().toISOString(),
      });

      await page.waitForSelector(
        ".card.card-body.shadow-form.card-summary.pt-3"
      );
      response = await page.evaluate(async (name) => {
        const res = await fetch(
          `https://www.truepeoplesearch.com/results?name=${name}`
        );

        return await res.text();
      }, name);
    }
    const dom = new JSDOM(response);
    const doc1 = dom.window.document;
    const links = Array.from(
      doc1.querySelectorAll(".card.card-body.shadow-form.card-summary.pt-3")
    );
    links.pop();
    const arr = links.map((lin) => lin.getAttribute("data-detail-link"));

    const response1 = await page.evaluate(async (arr) => {
      let ps = [];
      let ps2 = [];

      for (let index = 0; index < arr.length; index++) {
        ps.push(fetch(`https://www.truepeoplesearch.com${arr[0]}`));
      }
      const data = await Promise.all(ps);
      for (let index = 0; index < data.length; index++) {
        ps2.push(data[index].text());
      }
      const data1 = await Promise.all(ps2);
      return data1;
    }, arr);

    let ps: any[] = [];
    for (let index = 0; index < response1.length; index++) {
      ps.push(getPage(response1[index]));
    }

    result = await Promise.all(ps);

    console.log("no error");
    await browser.close();

    return result;
  } catch (error) {
    console.log("rror............");

    console.log(error);
    debugger;
    await browser.close();

    return error;
  }
};
//scrape("Kara Lynn Gentile");
