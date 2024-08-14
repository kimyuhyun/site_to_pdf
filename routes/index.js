const express = require("express");
const router = express.Router();
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
// global.ReadableStream = require('web-streams-polyfill/ponyfill/es6').ReadableStream;
global.ReadableStream = require("stream/web").ReadableStream;

router.get("/", async (req, res, next) => {
    const url = req.query.url;

    const folder = "./pdf";
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }

    if (!url) {
        return res.status(400).send("URL is required");
    }

    try {
        const browser = await puppeteer.launch({
            headless: true, // 헤드리스 모드로 브라우저 실행
            // executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", // Mac의 경우
            executablePath: "/usr/local/bin/chromium", // 우분투
            args: [
                "--no-sandbox",
                // "--single-process",
                // "--disable-dev-shm-usage",
                // "--disable-gpu",
                // "--disable-software-rasterizer",
            ],
        });
        const page = await browser.newPage();

        await page.goto(url, {
            waitUntil: "networkidle0", // 대기, 페이지가 완전히 로드될 때까지
        });

        await page.pdf({
            path: `${folder}/output.pdf`,
            format: "A4", // PDF 형식 A4
            printBackground: false, // 페이지 배경 포함
        });
        await browser.close();

        // HTTP 경로 생성 및 반환
        const pdfUrl = `${req.protocol}://${req.get("host")}/pdf/output.pdf`;
        res.json({ code: 1, url: pdfUrl });
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while generating the PDF");
    }

    // res.json({
    //     title: "API",
    //     mode: process.env.NODE_ENV,
    // });
});

module.exports = router;
