import asyncio

class AlertManager:
    def __init__(self):
        self.alerts = []
        self.subs = [] # Subscribers (like the websocket manager)

    def add_alert(self, alert):
        self.alerts.append(alert)
        self._notify_subs(alert)

    def subscribe(self, callback):
        self.subs.append(callback)

    def _notify_subs(self, alert):
        for sub in self.subs:
            sub(alert)

alert_manager = AlertManager()
