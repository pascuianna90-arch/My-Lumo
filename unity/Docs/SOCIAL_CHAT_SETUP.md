# My Lumo — two separate chat areas

The social area is intentionally split into two tabs.

## 1. Beszélj Lumóval
This is the private-feeling AI character conversation.

Flow:
player message -> My Lumo backend -> AI reply -> Lumo speech bubble beside the 3D character.

Use:
- LumoChatClient
- LumoChatWallController
- LumoEmotionBubble

The OpenAI key remains only on the server.

## 2. Közösségi chat
This is the people-to-people public wall.

Flow:
player message -> My Lumo backend -> public wall -> other players see it.

Use:
- CommunityChatClient
- CommunityChatWallController

The first implementation includes:
- recent public messages,
- automatic refresh,
- posting,
- basic spam throttling,
- basic content filtering,
- report endpoint.

## Tabs
Use SocialTabsController with two buttons:
- "Lumo chat"
- "Közösségi chat"

These are separate systems and should never be visually mixed into one message list.
