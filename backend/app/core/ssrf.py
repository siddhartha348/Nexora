import socket
import ipaddress
from urllib.parse import urlparse
from typing import Tuple

BLOCKED_IP_NETWORKS = [
    ipaddress.ip_network("127.0.0.0/8"),      # Loopback
    ipaddress.ip_network("10.0.0.0/8"),       # Private Class A
    ipaddress.ip_network("172.16.0.0/12"),    # Private Class B
    ipaddress.ip_network("192.168.0.0/16"),   # Private Class C
    ipaddress.ip_network("169.254.0.0/16"),   # Link-Local (AWS metadata, etc.)
    ipaddress.ip_network("0.0.0.0/8"),        # Current network
    ipaddress.ip_network("224.0.0.0/4"),      # Multicast
    ipaddress.ip_network("240.0.0.0/4"),      # Reserved
    ipaddress.ip_network("::1/128"),          # IPv6 loopback
    ipaddress.ip_network("fc00::/7"),         # IPv6 unique local
    ipaddress.ip_network("fe80::/10"),        # IPv6 link-local
]

class SSRFSecurityError(Exception):
    pass

def validate_url_safe_for_ssrf(url: str) -> Tuple[bool, str]:
    """
    Validates a URL against Server-Side Request Forgery (SSRF) vulnerabilities.
    Enforces:
      - Only http and https protocols
      - Hostname DNS resolution
      - Rejection of private, loopback, link-local, and cloud metadata IP ranges
    """
    try:
        parsed = urlparse(url)
    except Exception as e:
        raise SSRFSecurityError(f"Invalid URL structure: {str(e)}")

    if parsed.scheme.lower() not in ("http", "https"):
        raise SSRFSecurityError(f"Unsupported scheme '{parsed.scheme}'. Only http and https are permitted.")

    hostname = parsed.hostname
    if not hostname:
        raise SSRFSecurityError("URL must contain a valid hostname.")

    # Disallow known localhost aliases
    if hostname.lower() in ("localhost", "127.0.0.1", "::1", "metadata.google.internal", "169.254.169.254"):
        raise SSRFSecurityError(f"Access to '{hostname}' is blocked by SSRF policy.")

    # Resolve hostname to all associated IP addresses
    try:
        addr_info = socket.getaddrinfo(hostname, None)
    except socket.gaierror as e:
        raise SSRFSecurityError(f"Unable to resolve hostname '{hostname}': {str(e)}")

    for entry in addr_info:
        ip_str = entry[4][0]
        try:
            ip_obj = ipaddress.ip_address(ip_str)
        except ValueError:
            continue

        for blocked_net in BLOCKED_IP_NETWORKS:
            if ip_obj in blocked_net:
                raise SSRFSecurityError(f"URL resolves to private/internal IP address '{ip_str}', blocked by SSRF policy.")

    return True, hostname

