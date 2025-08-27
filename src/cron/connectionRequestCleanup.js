const cron = require("node-cron");
const { subDays } = require("date-fns");
const connectionRequest = require("../model/connectionRequest");

cron.schedule("0 0 1 * *", async () => {
  try {
    const today = new Date();
    const boundaryDate = subDays(today, 7);

    const res = await connectionRequest.deleteMany({ createdAt: { $lt: boundaryDate } });
    console.log(res);
  } catch (err) {
    console.log("failed to run Job: " + err);
  }
});
