# Telegram Crypto Sales Bot

This is a Telegram bot for selling crypto class subscriptions. It's built with Node.js, Express, Telegraf, and Mongoose, and is designed to be deployed on Vercel.

## Features

-   **Telegram Bot Interface:** A simple and intuitive interface for users to interact with the bot.
-   **Subscription Management:** Users can subscribe to monthly or lifetime plans.
-   **Payment Processing:** The bot accepts payments via Paystack (for card payments) and NowPayments (for USDT payments).
-   **Analytics:** The bot uses Mixpanel to track user events.
-   **Production-Ready:** The bot is built with a production-ready MVCR architecture.

## Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   MongoDB
-   A Telegram bot token
-   A Paystack account
-   A NowPayments account
-   A Mixpanel account
-   A Vercel account

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/crypto-sales-bot.git
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Rename `.env.example` to `.env` and fill in the required values.
4.  Build the project:
    ```bash
    npm run build
    ```
5.  Start the project:
    ```bash
    npm start
    ```

### Deployment

The bot is designed to be deployed on Vercel. To deploy the bot, you will need to:

1.  Create a Vercel account.
2.  Create a new project and link it to your GitHub repository.
3.  Configure the environment variables in the Vercel dashboard.
4.  Deploy the project.

## Project Structure

The project is structured using the MVCR (Model-View-Controller-Router) architecture:

-   `src/controllers`: Contains the controllers for the bot and payment logic.
-   `src/models`: Contains the Mongoose models.
-   `src/routes`: Contains the Express routes.
-   `src/services`: Contains the services for payment processing.
-   `src/utils`: Contains the utility functions for database connection and analytics.

## Contributing

Contributions are welcome! Please feel free to submit a pull request.
