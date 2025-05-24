import schedule from 'node-schedule';
import api from "@/axios/api";
import { getPriceAlertTriggeredTemplate } from "@/common/heplers/getPriceAlertSuccessTemplate";
import logger from "@/common/logger/logger";
import { sendEmail } from "@/common/utils/mail";
import { User } from "@/database";
import dbConnect from "@/database/dbConnect";

const scanPriceAlert = async () => {
  const users = await User.find(); // Retrieve all users

  // Create a map of user notifications
  const notifications = users.reduce<{ [key: string]: any[] }>((acc, user: any) => {
    const userNotifications = user.priceNotifications;
    if (userNotifications && userNotifications.length > 0) {
      acc[user._id] = userNotifications;
    }
    return acc;
  }, {}); // {userId: notifications}

  const uidHasNoti = Object.keys(notifications);

  for (let i = 0; i < uidHasNoti.length; i++) {
    const userId = uidHasNoti[i]; // User ID
    const notiList = notifications[userId]; // Notification list for the user
    const userEmail = users.find((user) => String(user._id) === userId)?.email;

    if (!userEmail) {
      logger.info(`No email found for user ID: ${userId}`);
      continue; // Skip this user if email is not available
    }

    const tickerToCheck = notiList.reduce<{ [key: string]: any }>((acc, noti) => {
      if (!acc[noti.ticker]) {
        acc[noti.ticker] = noti;
      }
      return acc;
    }, {}); // Collect tickers to check

    logger.info(`Checking price alerts for user ID: ${userId}`);

    try {
      const priceChecks = await Promise.all(
        Object.keys(tickerToCheck).map(async (ticker) => {
          try {
            const matchPrice = await api.getMatchPrice(ticker);
            return { ticker, matchPrice };
          } catch (error) {
            console.error(`Error fetching price for ticker ${ticker}:`, error);
            return { ticker, matchPrice: null }; // Return null if there's an error fetching the price
          }
        })
      ); // Fetch prices for all tickers

      // Create a price map for quick lookups
      const priceMap = priceChecks.reduce<{ [key: string]: number }>((acc, { ticker, matchPrice }) => {
        if (matchPrice !== null) {
          acc[ticker] = matchPrice;
        }
        return acc;
      }, {});

      for (let j = 0; j < notiList.length; j++) {
        const noti = notiList[j];
        const { ticker, price: expectedPrice, trend, _id } = noti;
        const matchPrice = priceMap[ticker];

        if (!matchPrice) continue;

        const sendMailCondition =
          (trend === "up" && Number(matchPrice) >= expectedPrice) ||
          (trend === "down" && Number(matchPrice) <= expectedPrice);

        if (sendMailCondition) {
          const template = getPriceAlertTriggeredTemplate(
            ticker,
            expectedPrice,
            matchPrice,
            userEmail
          );

          try {
            // Send the email
            logger.info(`Sending price alert email to: ${userEmail}`);
            await sendEmail({
              html: template,
              subject: `${ticker} Price Reached`,
              email: userEmail as string,
            });

            // Remove the notification from the user's list after sending the email
            await User.updateOne(
              { _id: userId },
              { $pull: { priceNotifications: { _id } } }
            );
            logger.info(`Notification for ${ticker} removed from user ID: ${userId}`);
          } catch (error) {
            console.error(`Error sending email to ${userEmail}:`, error);
          }
        }
      }
    } catch (error) {
      console.error(`Error processing price alerts for user ID: ${userId}:`, error);
    }
  }
};

dbConnect
  .connect()
  .then(() => {
   logger.info("Connected to the database");
    schedule.scheduleJob('*/30 * * * *', async () => {
     logger.info("Running scanPriceAlert...");
      try {
        await scanPriceAlert();
      } catch (error) {
        console.error("Error running scanPriceAlert:", error);
      }
    });
   logger.info("Scheduled scanPriceAlert to run every 30 minutes");
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });