/**
 * Promote an existing account to ADMIN.
 *   pnpm grant-admin someone@example.com
 *
 * Same effect as listing the address in ADMIN_EMAILS, but it works on an
 * account that already signed up, without waiting for their next page load.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error("Usage: pnpm grant-admin <email>");
    process.exit(1);
  }

  const user = await db.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });

  if (!user) {
    console.error(
      `No account with ${email}. Sign up first at /sign-up, then run this again.`,
    );
    const known = await db.user.findMany({
      where: { clerkId: { not: null } },
      select: { email: true, role: true },
    });
    if (known.length) {
      console.error("\nAccounts that exist:");
      for (const k of known) console.error(`  ${k.role.padEnd(6)} ${k.email}`);
    }
    process.exit(1);
  }

  if (user.role === "LAWYER") {
    console.error(
      `${email} is an advocate account. Use a different address for admin so the two roles stay separate.`,
    );
    process.exit(1);
  }

  await db.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
  console.log(`${email} is now ADMIN — open /admin/verification`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
