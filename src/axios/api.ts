import envConfig from "@/common/config/envConfig";
import axios from "axios";
import type { AxiosInstance } from "axios";
class Api {
  instance: AxiosInstance;
  constructor() {
    this.instance = axios.create({
      baseURL: envConfig.dataApiUrl,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async getMatchPrice(ticker: string) {
    const response = await this.instance.get(`ticker/price-board/${ticker}`);
    return response.data[0]["('match', 'match_price')"];
  }
}
const api = new Api();
export default api;
