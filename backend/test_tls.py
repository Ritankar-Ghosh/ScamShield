import socket
import ssl

hostname = "ac-negprjc-shard-00-00.7tazu6x.mongodb.net"
port = 27017

print("Testing TLS connection...")
print("Host:", hostname)
print("Port:", port)
print()

context = ssl.create_default_context()

try:
    with socket.create_connection(
        (hostname, port),
        timeout=15
    ) as sock:

        print("TCP connection: SUCCESS")

        with context.wrap_socket(
            sock,
            server_hostname=hostname
        ) as tls_sock:

            print("TLS connection: SUCCESS")
            print("TLS version:", tls_sock.version())
            print("Cipher:", tls_sock.cipher())
            print("Certificate subject:")
            print(tls_sock.getpeercert().get("subject"))

except Exception as e:

    print("TLS connection: FAILED")
    print()
    print(type(e).__name__)
    print(e)