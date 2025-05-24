import envConfig from "@/common/config/envConfig";
import Redis from "ioredis";

const redis = new Redis({
  host: envConfig.redisHost,
  port: 6379,
});
export const sendSignal = (channel: string, message: string) => {
  redis.publish(channel, message);
  console.log(`Sent message: "${message}" to channel: "${channel}"`);
};
export default redis;
