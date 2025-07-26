### Deadlock API SSE Example

This repository contains a minimal example demonstrating how to use the **Server-Sent Events (SSE)** feature from **deadlock-api**.

**Note:** This will not be maintained or updated. If you encounter issues, your best bet is to join the **deadlock-api Discord** and **nicely** ask for help.
[![Example](https://i.imgur.com/YoAnhab.gif)]([https://i.imgur.com/6z2UdFd.mp4](https://i.imgur.com/YoAnhab.gif))


---

### 📦 Installation

1. **Install Dependencies**

```bash
npm install dotenv@17.2.1 eventsource@4.0.0 express@5.1.0 node-fetch@2.7.0 socket.io@4.8.1
```

2. **Set Up `.env` (Optional)**

Create a `.env` file in the project root with your API key (if you have one):

```env
API_KEY=your_api_key_here
```

If you don’t have an API key, either omit the `.env` file or comment out the `X-API-Key` header in the `EventSource` configuration inside `server.js`:

```js
const es = new EventSource(sseUrl, {
  headers: {
    'Accept': '*/*',
    // 'X-API-Key': process.env.API_KEY
  }
});
```
3. **Set the Match ID**

Before running the script, **edit the `matchId` variable** in `server.js` to any active match you want to stalk.

```js
const matchId = '38227403';
const sseUrl = `http://api.deadlock-api.com/v1/matches/${matchId}/live/demo/events`;
```

If you're feeling fancy, consider making this dynamic (e.g. via CLI args or environment variable/whatever).

4. **Run the Example**

```bash
node server.js
```
By default the page should be available at
```bash
http://localhost:3000
```
**Note:**  
As of **July 26, 2025**, the `deadlock-api` enforces a rate limit of **10 connections per IP per hour** for users **without an API key**.  
To obtain an API key, join the [official Discord server](#) and request one there.

