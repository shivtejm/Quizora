const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 SIES Backend Server is running on port ${PORT}`);
    console.log(`📡 API Health Check: http://localhost:${PORT}/api/health`);
    console.log(`📚 Questions API:    http://localhost:${PORT}/api/questions`);
    console.log(`📊 Results API:      http://localhost:${PORT}/api/results`);
    console.log(`💻 Frontend Static:  http://localhost:${PORT}/index.html`);
    console.log(`=======================================================`);
});
