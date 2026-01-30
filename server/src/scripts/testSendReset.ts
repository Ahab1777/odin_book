import "dotenv/config";
import { sendResetEmail } from "../lib/resend";

async function main() {
	const [,, emailArg, tokenArg] = process.argv;

	const email = emailArg ?? process.env.TEST_RESET_EMAIL;
	const token = tokenArg ?? "test-reset-token";

	if (!email) {
		console.error(
			"Usage: tsx src/scripts/testSendReset.ts <email> [token]\n" +
			"Alternatively, set TEST_RESET_EMAIL in your environment."
		);
		process.exit(1);
	}

	try {
		await sendResetEmail(email, token);
		console.log(`Password reset email sent to ${email} with token ${token}`);
	} catch (error) {
		console.error("Failed to send password reset email:", error);
		process.exit(1);
	}
}

void main();

