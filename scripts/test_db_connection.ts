import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

async function testConnection() {
  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;

  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL not found in environment variables.');
    console.log('Current env vars:', Object.keys(process.env).filter(k => k.includes('DB') || k.includes('URL')));
    process.exit(1);
  }

  // Mask password for safe logging
  const maskedUrl = connectionString.replace(/:([^:@]+)@/, ':****@');
  console.log(`Testing connection to: ${maskedUrl}`);

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }, // Required for Supabase
    connectionTimeoutMillis: 5000, // Fail fast (5s)
  });

  try {
    console.log('Connecting...');
    await client.connect();
    console.log('✅ Connection SUCCESSFUL!');
    
    const res = await client.query('SELECT NOW() as now');
    console.log('Query result:', res.rows[0]);
    
    await client.end();
  } catch (err: any) {
    console.error('\n❌ Connection FAILED');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    if (err.code) console.error('Error Code:', err.code);
    if (err.syscall) console.error('Syscall:', err.syscall);
    if (err.address) console.error('Address:', err.address);
    if (err.port) console.error('Port:', err.port);
    
    // Diagnosis hints
    if (err.code === 'ENOTFOUND') {
      console.log('\n💡 Hint: Hostname not found. Check if the Supabase URL is correct.');
    } else if (err.code === 'ECONNREFUSED') {
      console.log('\n💡 Hint: Connection refused. Check if the port is correct (5432 or 6543) and not blocked by firewall.');
    } else if (err.message.includes('password authentication failed')) {
      console.log('\n💡 Hint: Wrong password. Special characters in password must be URL-encoded?');
    } else if (err.message.includes('getaddrinfo EAI_AGAIN')) {
      console.log('\n💡 Hint: DNS lookup failed. Network issue?');
    }

    // Attempt Direct Connection if Pooler fails
    if (connectionString.includes('pooler.supabase.com') && connectionString.includes('6543')) {
      console.log('\n🔄 Attempting Direct Connection (Port 5432)...');
      
      // Extract project ref from username or host?
      // Username format: postgres.projectref or just postgres
      // Host format: aws-0-region.pooler.supabase.com
      // We need to guess the direct host: db.projectref.supabase.co
      
      // Try to extract project ref from user part of connection string
      // postgresql://User:Pass@Host:Port/Db
      const userMatch = connectionString.match(/postgresql:\/\/([^:]+):/);
      let projectRef = '';
      if (userMatch && userMatch[1].includes('.')) {
        projectRef = userMatch[1].split('.')[1];
      }

      if (projectRef) {
        const directHost = `db.${projectRef}.supabase.co`;
        const directUrl = connectionString
          .replace(/:6543/, ':5432')
          .replace(/@([^/]+)\//, `@${directHost}/`)
          // Fix username for direct connection? usually just 'postgres' works, 
          // but 'postgres.ref' is also valid for pooler. 
          // For direct, usually 'postgres' is standard but let's try keeping it first.
          // Actually for direct connection, username is usually just 'postgres'.
          .replace(userMatch![1], 'postgres');

        console.log(`Testing direct connection to: ${directUrl.replace(/:([^:@]+)@/, ':****@')}`);
        
        const directClient = new Client({
          connectionString: directUrl,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 5000,
        });

        try {
          await directClient.connect();
          console.log('✅ Direct Connection SUCCESSFUL!');
          await directClient.end();
          console.log('💡 Conclusion: The Transaction Pooler (port 6543) is down or blocking, but the Database is UP.');
          console.log('   Action: Use the Direct URL (port 5432) in your .env temporarily.');
        } catch (directErr: any) {
          console.error('❌ Direct Connection FAILED');
          console.error('Error:', directErr.message);
          
          if (directErr.message.includes('getaddrinfo ENOTFOUND')) {
             // Fallback: maybe project ref extraction was wrong?
          }
        }
      } else {
        console.log('Could not extract project ref to try direct connection.');
      }
    }
  }
}

testConnection();