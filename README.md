DjuChat
============

Implementation of real-time chat.

DjuChat/client - Simple front end built in Javascript.

DjuChat/server - PHP powered server for non-Websocket browsers. Uses polling to determine presence and messaging.

DjuChat/websocket - Node.js powered server for Websocket compliant browsers. Uses broadcasting for presence and messaging.

All chat data is persisted in memcache.

Improvements:
- Functional UI with chat sending
- Design with scalability in mind
