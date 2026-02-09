import net from 'net';

const portArg = process.argv[2];
const port = Number(portArg || 5173);

if (!Number.isInteger(port) || port <= 0) {
  console.error(`Invalid port: ${portArg}`);
  process.exit(1);
}

const server = net.createServer();
server.unref();

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Stop the process using it or pick another port.`);
    process.exit(1);
  }

  console.error(`Failed to check port ${port}: ${error.message}`);
  process.exit(1);
});

server.listen(port, '127.0.0.1', () => {
  server.close(() => {
    process.exit(0);
  });
});
