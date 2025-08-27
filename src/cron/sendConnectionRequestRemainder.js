const cron = require("node-cron");
const connectionRequest = require("../model/connectionRequest");
const { subDays } = require("date-fns");
const sendEmail = require("../utils/mailer");

cron.schedule("0 0 1 * *", async () => {
  try {
    const connectionRequests = await connectionRequest
      .find({})
      .populate("toUserId");

    const map = new Map();

    connectionRequests.forEach((request) => {
      const toUser = request.toUserId;
      if (!toUser) return;
      if (!toUser.verified) return;

      const userMail = toUser.email;

      if (map.has(userMail)) {
        map.get(userMail).count += 1;
      } else {
        map.set(userMail, { firstName: toUser.firstName, count: 1 });
      }
    });

    for (const [email, data] of map) {
      await sendEmail(
        email,
        "Pending Connection Request",
        "pendingConnection",
        {
          name: data.firstName,
          pendingCount: data.count,
          ctaLink: `http://localhost:5173/login`,
        }
      );
    }

    console.log(connectionRequests);
  } catch (err) {
    console.log("failed to run Job: " + err);
  }
});