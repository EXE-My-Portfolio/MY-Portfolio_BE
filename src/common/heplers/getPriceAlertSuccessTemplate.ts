export const getPriceAlertTriggeredTemplate = (
    ticker: string,
    expectedPrice: number,
    currentPrice: number,
    userEmail: string
  ) => {
    return `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Price Alert Reached</title>
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      background-color: #f4f7fc;
                      color: #333;
                      margin: 0;
                      padding: 0;
                  }
                  .email-container {
                      max-width: 600px;
                      margin: 0 auto;
                      background-color: #ffffff;
                      padding: 20px;
                      border-radius: 8px;
                      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                  }
                  .email-header {
                      text-align: center;
                      padding: 10px;
                      background-color: #4CAF50;
                      color: #fff;
                      border-radius: 8px 8px 0 0;
                  }
                  .email-header h2 {
                      margin: 0;
                  }
                  .email-content {
                      padding: 20px;
                      font-size: 1.1em;
                  }
                  .email-footer {
                      text-align: center;
                      padding: 15px;
                      font-size: 0.9em;
                      color: #777;
                      background-color: #f9f9f9;
                      border-radius: 0 0 8px 8px;
                  }
                  .email-footer a {
                      color: #4CAF50;
                      text-decoration: none;
                  }
                  .button {
                      display: inline-block;
                      background-color: #4CAF50;
                      color: white;
                      padding: 10px 20px;
                      text-decoration: none;
                      font-weight: bold;
                      border-radius: 5px;
                      margin-top: 20px;
                  }
                  .button:hover {
                      background-color: #45a049;
                  }
              </style>
          </head>
          <body>
              <div class="email-container">
                  <div class="email-header">
                      <h2>Price Alert Reached</h2>
                  </div>
                  <div class="email-content">
                      <p>Dear ${userEmail},</p>
                      <p>We are notifying you that the price you set for the <strong>${ticker}</strong> has been reached!</p>
                      <p>Your alert was set for <strong>${expectedPrice.toLocaleString()} VND</strong>, and the current price is now <strong>${currentPrice.toLocaleString()} VND</strong>.</p>
                      <p>We wanted to keep you informed of this price change, so you can take action based on your trading strategy.</p>
                      <p>Alert details:</p>
                      <ul>
                          <li><strong>Ticker:</strong> ${ticker}</li>
                          <li><strong>Alert Price:</strong> ${expectedPrice.toLocaleString()} VND</li>
                          <li><strong>Current Price:</strong> ${currentPrice.toLocaleString()} VND</li>
                          <li><strong>Time:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })}</li>
                      </ul>
                      <a href="#" class="button">Manage Your Alerts</a>
                  </div>
                  <div class="email-footer">
                      <p>Best regards,</p>
                      <p><strong>FaiseStock Team</strong></p>
                  </div>
              </div>
          </body>
          </html>
      `;
  };
  