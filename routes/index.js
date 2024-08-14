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

        const unixTimestampInMilliseconds = Date.now();
        const outputPath = `${folder}/${unixTimestampInMilliseconds}.pdf`;
        console.log(outputPath);

        await page.pdf({
            path: `${folder}/${unixTimestampInMilliseconds}.pdf`,
            format: "A4", // PDF 형식 A4
            printBackground: false, // 페이지 배경 포함
        });
        await browser.close();

        // HTTP 경로 생성 및 반환
        const pdfUrl = `${req.protocol}://${req.get("host")}/${outputPath.replace("./", "")}`;
        res.json({ code: 1, url: pdfUrl, filename: `${unixTimestampInMilliseconds}.pdf` });
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while generating the PDF");
    }
});

router.get("/file_delete", async (req, res, next) => {
    const filename = req.query.filename;

    if (!filename) {
        return res.status(400).send("filename is required");
    }

    const folder = "./pdf";
    const filePath = `${folder}/${filename}`;
    fs.unlink(filePath, (err) => {
        if (err) {
            res.json({ code: 0, message: `Failed to delete file:, ${err}` });
        } else {
            res.json({ code: 1, message: `FDeleted file:, ${filePath}` });
        }
    });
});

module.exports = router;
