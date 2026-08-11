import socket
import logging
from zeroconf import ServiceInfo, Zeroconf

logger = logging.getLogger("onedeck-discovery")

class DeviceAdvertiser:
    def __init__(self, device_type, port=8000, device_name=None):
        self.zeroconf = Zeroconf()
        self.device_type = device_type
        self.port = port
        
        hostname = socket.gethostname()
        self.device_name = device_name or hostname
        
        # The service type must be a valid mDNS service type, e.g., _http._tcp.local. or a custom one
        self.service_type = "_onedeck._tcp.local."
        self.service_name = f"{self.device_name}-{self.device_type}.{self.service_type}"
        
        # Get local IP address (naive approach, works for simple setups)
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            self.ip = s.getsockname()[0]
            s.close()
        except Exception:
            self.ip = "127.0.0.1"

        self.info = ServiceInfo(
            self.service_type,
            self.service_name,
            addresses=[socket.inet_aton(self.ip)],
            port=self.port,
            properties={
                "type": self.device_type,
                "name": self.device_name
            },
            server=f"{hostname}.local.",
        )

    def start(self):
        logger.info(f"Registering mDNS service {self.service_name} at {self.ip}:{self.port}")
        self.zeroconf.register_service(self.info)

    def stop(self):
        logger.info(f"Unregistering mDNS service {self.service_name}")
        self.zeroconf.unregister_service(self.info)
        self.zeroconf.close()
