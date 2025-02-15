module.exports = {
  expo: {
    name: "Digital Dealer Mobile",
    slug: "digital-dealer-mobile",
    // ... other expo config
    
    extra: {
      apiUrl: process.env.API_URL || 'http://172.16.20.0:3000',
      wsUrl: process.env.WS_URL || 'ws://172.16.20.0:3000',
      eas: {
        projectId: "your-project-id"
      }
    }
  }
}; 