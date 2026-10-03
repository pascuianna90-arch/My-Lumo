# My Lumo — Chat wall + AI Lumo

## Player experience
Players can write on the My Lumo chat wall. A message sent to Lumo goes to the secure My Lumo backend, which asks the AI for a short in-character reply. The reply appears in the small speech bubble beside Lumo's head.

Examples:
- Player: "Szia Lumo, hogy vagy?"
- Lumo bubble: "Szia! Nagyon örülök, hogy itt vagy. ❤️"

- Player: "Mit csináljunk ma?"
- Lumo bubble: "Menjünk a parkba, aztán ehetnénk valami finomat! 😺"

## Security
The OpenAI API key belongs only on the Railway/server environment as OPENAI_API_KEY.
Never put the key in Unity, browser JavaScript, GitHub source code, or a downloadable game build.

## Backend
- GET /api/chat returns recent public chat-wall items.
- POST /api/chat sends a player message and returns Lumo's AI reply.
- A lightweight session id gives Lumo a small amount of recent conversation context.
- Public messages are length-limited and screened by the existing safety filter.
- The server prompt keeps Lumo warm, short, family-friendly and suitable for a speech bubble.

## Unity
Attach LumoChatClient to GameSystems and connect the Railway base URL, LumoEmotionBubble, and LumoAnimatorBridge.
Attach LumoChatWallController to the chat panel and connect TMP input, send button, LumoChatClient, and optional status text.
The AI reply is then shown directly in Lumo's world-space bubble.
