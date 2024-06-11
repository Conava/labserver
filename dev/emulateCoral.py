import socket
import argparse


def start_server(host, port):
    # Create a TCP/IP socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        # Bind the socket to the port
        s.bind((host, port))
        print(f"Server started on {host}:{port}")

        while True:
            # Listen for incoming connections
            s.listen()
            print("Waiting for a connection...")
            connection, client_address = s.accept()

            try:
                print(f"Connection from {client_address}")
                # Receive the data in small chunks
                data = connection.recv(16)
                print(f"Received: {data.decode()}")

                # Get user input for the response message
                message = input("Enter the message to send in response to a connection: ")

                # Send response
                if data:
                    print("Sending response...")
                    connection.sendall(message.encode())
                else:
                    print("No data received")

            finally:
                # Clean up the connection
                connection.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='TCP Server for Authentication')
    args = parser.parse_args()

    start_server('localhost', 44000)
