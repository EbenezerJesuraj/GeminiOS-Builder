"""
Gemini OS — Event Bus

Lightweight async pub/sub event bus for inter-agent communication.
Supports topic-based routing with wildcard subscriptions.
"""

import asyncio
import logging
from dataclasses import dataclass, field
from typing import Callable, Awaitable

logger = logging.getLogger("gemini-orchestrator.eventbus")

Subscriber = Callable[["Event"], Awaitable[None]]


@dataclass
class Event:
    topic: str
    action: str
    data: dict = field(default_factory=dict)
    source: str = "system"


class EventBus:
    """Async event bus for Gemini OS inter-component communication."""

    def __init__(self):
        self._subscribers: dict[str, list[Subscriber]] = {}
        self._running = False

    async def start(self):
        self._running = True
        logger.info("Event bus started.")

    async def stop(self):
        self._running = False
        self._subscribers.clear()
        logger.info("Event bus stopped.")

    def subscribe(self, topic: str, handler: Subscriber):
        if topic not in self._subscribers:
            self._subscribers[topic] = []
        self._subscribers[topic].append(handler)
        logger.debug(f"Subscribed to topic: {topic}")

    def unsubscribe(self, topic: str, handler: Subscriber):
        if topic in self._subscribers:
            self._subscribers[topic] = [
                h for h in self._subscribers[topic] if h != handler
            ]

    async def publish(self, event: Event):
        if not self._running:
            return

        handlers = []

        # Exact match
        if event.topic in self._subscribers:
            handlers.extend(self._subscribers[event.topic])

        # Wildcard match (e.g., "system.*" matches "system.cpu")
        for pattern, subs in self._subscribers.items():
            if pattern.endswith(".*"):
                prefix = pattern[:-2]
                if event.topic.startswith(prefix) and event.topic != pattern:
                    handlers.extend(subs)

        for handler in handlers:
            try:
                await handler(event)
            except Exception as e:
                logger.error(f"Event handler error on {event.topic}: {e}")
