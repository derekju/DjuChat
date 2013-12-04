DjuChat
============

Implementation of real-time chat.

DjuChat/client - Simple front end built in Javascript.

DjuChat/server - PHP powered server for non-Websocket browsers. Uses polling to determine presence and messaging.

DjuChat/nodeserver - Node.js powered server for both non-Websocket and Websocket browsers. Folds logic of the PHP server into a node implementation as well as the Websocket functionality.

All chat data is persisted in memcache.

Improvements:
- Functional UI with chat sending
- Design with scalability in mind
