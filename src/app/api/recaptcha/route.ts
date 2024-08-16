import { NextResponse } from "next/server";
import axios from "axios";
import chalk from "chalk";

export async function POST(request: Request) {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
        console.error("RECAPTCHA_SECRET_KEY is not defined.");
        return NextResponse.json({ success: false, message: "Server configuration error." });
    }

    const postData = await request.json();
    const { gRecaptchaToken } = postData;

    if (!gRecaptchaToken) {
        console.error("No reCAPTCHA token provided.");
        return NextResponse.json({ success: false, message: "reCAPTCHA token is missing." });
    }

    const formData = `secret=${secretKey}&response=${gRecaptchaToken}`;

    try {
        const res = await axios.post(
            "https://www.google.com/recaptcha/api/siteverify",
            formData,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        if (res.data?.success) {
            const score = res.data.score;
            let color = chalk.yellow; 

            if (score >= 0.9) {
                color = chalk.green;
            } else if (score <= 0.4) {
                color = chalk.red;
            }

            console.log(color(`reCAPTCHA verification successful with a score of ${score}`));
            return NextResponse.json({
                success: true,
                score: score,
                message: "reCAPTCHA verification passed.",
            });
        } else {
            console.warn(chalk.red(`reCAPTCHA verification failed with a score of ${res.data?.score}`));
            return NextResponse.json({
                success: false,
                message: "reCAPTCHA verification failed.",
            });
        }
    } catch (error) {
        console.error("Error during reCAPTCHA verification:", error);
        return NextResponse.json({ success: false, message: "Error during reCAPTCHA verification." });
    }
}
